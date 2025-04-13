import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const useFaceExpression = () => {
  const [currentExpression, setCurrentExpression] = useState(null);
  const [expressionConfidence, setExpressionConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();
  const containerRef = useRef();
  const emotionTextRef = useRef();
  const initializedRef = useRef(false);
  const detectionLoopRef = useRef(null);
  const isLoadingRef = useRef(true);

  useEffect(() => {
    const initializeFaceDetection = async () => {
      // Prevent double initialization
      if (initializedRef.current) {
        console.log('Already initialized, skipping...');
        return;
      }
      initializedRef.current = true;

      try {
        console.log('Initializing face detection...');
        
        // Create container for video and canvas
        containerRef.current = document.createElement('div');
        containerRef.current.style.position = 'fixed';
        containerRef.current.style.bottom = '20px';
        containerRef.current.style.left = '50%';
        containerRef.current.style.transform = 'translateX(-50%)';
        containerRef.current.style.width = '320px';
        containerRef.current.style.maxWidth = '90vw'; // Limit width on mobile
        containerRef.current.style.zIndex = '9999';
        containerRef.current.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
        containerRef.current.style.borderRadius = '12px';
        containerRef.current.style.pointerEvents = 'auto';
        
        // Add media query styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                #face-detection-container {
                    width: 280px !important;
                    bottom: 10px !important;
                }
                #face-detection-container video {
                    width: 100% !important;
                    height: auto !important;
                }
                #face-detection-container canvas {
                    width: 100% !important;
                    height: auto !important;
                }
                #emotion-text {
                    font-size: 16px !important;
                    padding: 8px !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        containerRef.current.id = 'face-detection-container';
        document.body.appendChild(containerRef.current);

        // Create emotion text display
        emotionTextRef.current = document.createElement('div');
        emotionTextRef.current.id = 'emotion-text';
        emotionTextRef.current.style.position = 'relative';
        emotionTextRef.current.style.width = '100%';
        emotionTextRef.current.style.height = '40px';
        emotionTextRef.current.style.backgroundColor = 'rgba(20, 20, 20, 0.9)';
        emotionTextRef.current.style.color = '#00ffff';
        emotionTextRef.current.style.textAlign = 'center';
        emotionTextRef.current.style.padding = '10px';
        emotionTextRef.current.style.fontSize = '20px';
        emotionTextRef.current.style.fontWeight = 'bold';
        emotionTextRef.current.style.borderRadius = '12px 12px 0 0';
        emotionTextRef.current.style.borderBottom = '2px solid #00ffff';
        emotionTextRef.current.style.textShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
        containerRef.current.appendChild(emotionTextRef.current);
        
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.style.position = 'relative';
        videoContainer.style.width = '320px';
        videoContainer.style.height = '240px';
        videoContainer.style.border = '2px solid #00ffff';
        videoContainer.style.borderRadius = '0 0 12px 12px';
        videoContainer.style.overflow = 'hidden';
        videoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        videoContainer.style.boxShadow = 'inset 0 0 20px rgba(0, 255, 255, 0.2)';
        containerRef.current.appendChild(videoContainer);
        
        // Load face detection models from CDN
        console.log('Loading face detection models...');
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        
        // Load each model individually with error handling
        try {
          console.log('Loading TinyFaceDetector...');
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          console.log('TinyFaceDetector loaded successfully');
        } catch (err) {
          console.error('Error loading TinyFaceDetector:', err);
        }

        try {
          console.log('Loading FaceLandmark68Net...');
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          console.log('FaceLandmark68Net loaded successfully');
        } catch (err) {
          console.error('Error loading FaceLandmark68Net:', err);
        }

        try {
          console.log('Loading FaceExpressionNet...');
          await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
          console.log('FaceExpressionNet loaded successfully');
        } catch (err) {
          console.error('Error loading FaceExpressionNet:', err);
        }

        // Verify models are loaded
        console.log('Verifying model loading...');
        console.log('TinyFaceDetector loaded:', faceapi.nets.tinyFaceDetector.isLoaded);
        console.log('FaceLandmark68Net loaded:', faceapi.nets.faceLandmark68Net.isLoaded);
        console.log('FaceExpressionNet loaded:', faceapi.nets.faceExpressionNet.isLoaded);

        // Request webcam access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 320,
            height: 240,
            facingMode: 'user'
          } 
        });
        console.log('Webcam access granted');
        
        // Create and setup video element
        videoRef.current = document.createElement('video');
        videoRef.current.srcObject = stream;
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = '100%';
        videoRef.current.style.objectFit = 'cover';
        videoRef.current.style.filter = 'brightness(1.1) contrast(1.1)';
        videoContainer.appendChild(videoRef.current);
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            resolve();
          };
        });
        
        await videoRef.current.play();
        console.log('Video stream started, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);

        // Create and setup canvas
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.style.position = 'absolute';
        canvasRef.current.style.top = '0';
        canvasRef.current.style.left = '0';
        canvasRef.current.style.width = '100%';
        canvasRef.current.style.height = '100%';
        canvasRef.current.style.mixBlendMode = 'screen';
        videoContainer.appendChild(canvasRef.current);
        
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        console.log('Canvas created with dimensions:', canvasRef.current.width, 'x', canvasRef.current.height);

        // Test canvas drawing
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(10, 10, 50, 50);
        console.log('Test drawing completed');

        // Model is ready after initialization
        isLoadingRef.current = false;
        setIsLoading(false);

        // Start detection loop
        const detectExpressions = async () => {
          if (!isLoadingRef.current && videoRef.current && videoRef.current.readyState === 4) {
            try {
              // Draw video frame to canvas
              const context = canvasRef.current.getContext('2d');
              context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              // Ensure video is playing and update frame
              if (videoRef.current.paused) {
                await videoRef.current.play();
              }
              
              context.drawImage(
                videoRef.current, 
                0, 0, 
                canvasRef.current.width, 
                canvasRef.current.height
              );
              
              // Detect faces and expressions
              const detections = await faceapi.detectAllFaces(
                canvasRef.current,
                new faceapi.TinyFaceDetectorOptions({
                  inputSize: 160,
                  scoreThreshold: 0.1
                })
              ).withFaceLandmarks().withFaceExpressions();
              
              if (detections && detections.length > 0) {
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                
                // Draw detection boxes
                faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
                
                // Process expressions for each face
                detections.forEach((detection) => {
                  if (detection.expressions) {
                    const nonNeutralExpressions = Object.entries(detection.expressions)
                      .filter(([expression]) => expression !== 'neutral')
                      .sort((a, b) => b[1] - a[1]);
                    
                    if (nonNeutralExpressions.length > 0) {
                      const [expression, confidence] = nonNeutralExpressions[0];
                      
                      // Update emotion text
                      emotionTextRef.current.textContent = `Emotion: ${expression} (${(confidence * 100).toFixed(1)}%)`;
                      
                      // Update state with expression and confidence
                      setCurrentExpression(expression);
                      setExpressionConfidence(confidence);
                    } else {
                      emotionTextRef.current.textContent = 'Emotion: Neutral';
                      setCurrentExpression('neutral');
                      setExpressionConfidence(0);
                    }
                  }
                });
              } else {
                emotionTextRef.current.textContent = 'No face detected';
                setCurrentExpression(null);
                setExpressionConfidence(0);
              }
            } catch (err) {
              console.error('Error in detection loop:', err);
            }
          }
          // Use requestAnimationFrame for smooth updates
          detectionLoopRef.current = requestAnimationFrame(detectExpressions);
        };

        // Start the detection loop
        console.log('Starting detection loop...');
        detectExpressions();
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize face detection: ' + err.message);
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    };

    initializeFaceDetection();

    return () => {
      console.log('Cleaning up face detection...');
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
      }
      if (containerRef.current) {
        document.body.removeChild(containerRef.current);
      }
      initializedRef.current = false;
      isLoadingRef.current = true;
    };
  }, []);

  return { currentExpression, expressionConfidence, isLoading, error };
};

export default useFaceExpression; 