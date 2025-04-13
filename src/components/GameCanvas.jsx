import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const GameCanvas = ({ onExpressionDetected }) => {
  const canvasRef = useRef();
  const p5Instance = useRef();
  const lastActionRef = useRef(null);
  const playerRef = useRef(null);

  // Custom collision detection function
  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  useEffect(() => {
    const sketch = (p) => {
      let player;
      let obstacles = [];
      let score = 0;
      let gameSpeed = 5;
      let gameOver = false;

      p.setup = () => {
        console.log('Setting up game canvas...');
        const canvas = p.createCanvas(800, 400);
        canvas.parent(canvasRef.current);
        canvas.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.3)';
        canvas.style.borderRadius = '12px';
        player = {
          x: 100,
          y: p.height - 50,
          width: 30,
          height: 50,
          jumping: false,
          ducking: false,
          dashing: false,
          velocityY: 0,
          gravity: 0.8,
          jumpForce: -12
        };
        playerRef.current = player;
        console.log('Player initialized:', player);
      };

      p.draw = () => {
        // Set background to dark gray with a subtle grid pattern
        p.background(20);
        p.stroke(40);
        p.strokeWeight(1);
        for (let i = 0; i < p.width; i += 20) {
          p.line(i, 0, i, p.height);
        }
        for (let i = 0; i < p.height; i += 20) {
          p.line(0, i, p.width, i);
        }
        
        if (gameOver) {
          // Game over screen
          p.fill(0, 0, 0, 200);
          p.rect(0, 0, p.width, p.height);
          
          p.fill('#00ffff');
          p.stroke(0);
          p.strokeWeight(2);

          // Game Over text
          p.push();
          p.textSize(p.width < 768 ? 20 : p.width * 0.08);
          p.textAlign(p.LEFT, p.CENTER);
          p.text('Game Over!', 10, p.height / 2 - 10);
          p.pop();

          // Final Score text
          p.push();
          p.textSize(p.width < 768 ? 16 : p.width * 0.05);
          p.textAlign(p.LEFT, p.CENTER);
          p.text(`Final Score: ${score}`, 10, p.height / 2 + 40);
          p.pop();

          p.noStroke();
          return;
        }

        // Update player position based on current state
        if (player.jumping) {
          player.velocityY += player.gravity;
          player.y += player.velocityY;
          
          // Check if player has landed
          if (player.y >= p.height - 50) {
            player.y = p.height - 50;
            player.velocityY = 0;
            player.jumping = false;
          }
        }

        if (player.ducking) {
          player.height = 25;
        } else {
          player.height = 50;
        }

        if (player.dashing) {
          player.x += 10;
        }

        // Draw player with neon effect
        p.fill('#00ffff');
        p.stroke('#00ffff');
        p.strokeWeight(2);
        p.rect(player.x, player.y, player.width, player.height);
        // Add glow effect
        p.drawingContext.shadowBlur = 15;
        p.drawingContext.shadowColor = '#00ffff';
        p.rect(player.x, player.y, player.width, player.height);
        p.drawingContext.shadowBlur = 0;

        // Generate and move obstacles
        if (p.frameCount % 60 === 0) {
          obstacles.push({
            x: p.width,
            y: p.height - 30,
            width: 20,
            height: 30
          });
        }

        // Update and draw obstacles with neon effect
        for (let i = obstacles.length - 1; i >= 0; i--) {
          obstacles[i].x -= gameSpeed;
          p.fill('#ff00ff');
          p.stroke('#ff00ff');
          p.strokeWeight(2);
          p.rect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
          // Add glow effect
          p.drawingContext.shadowBlur = 15;
          p.drawingContext.shadowColor = '#ff00ff';
          p.rect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
          p.drawingContext.shadowBlur = 0;

          if (checkCollision(player, obstacles[i])) {
            gameOver = true;
          }

          if (obstacles[i].x < -obstacles[i].width) {
            obstacles.splice(i, 1);
            score++;
            if (score % 10 === 0) {
              gameSpeed += 1;
            }
          }
        }

        // Display score
        p.textSize(32);
        p.fill('#00ffff');
        p.stroke(0);
        p.strokeWeight(2);
        p.textAlign(p.LEFT, p.TOP);
        p.text(`Score: ${score}`, 20, 20);
        p.noStroke();
      };
    };

    p5Instance.current = new p5(sketch);
    console.log('p5 instance created');

    return () => {
      p5Instance.current.remove();
    };
  }, []);

  // Listen for action changes
  useEffect(() => {
    if (onExpressionDetected) {
      console.log('Action detection handler initialized');
      
      const handleAction = () => {
        const action = onExpressionDetected();
        
        if (!action) {
          return;
        }

        // Process jump action immediately without checking last action
        if (action.type === 'jump' && playerRef.current) {
          const player = playerRef.current;
          
          // Allow jump if player is on or near the ground
          if (!player.jumping && player.y >= 340) { // Slightly more lenient ground check
            console.log('Initiating jump!');
            player.jumping = true;
            player.velocityY = player.jumpForce;
            // Reset last action to allow consecutive jumps
            lastActionRef.current = null;
          }
        }
      };

      // Check for actions more frequently
      const pollInterval = setInterval(handleAction, 16); // ~60fps

      return () => clearInterval(pollInterval);
    }
  }, [onExpressionDetected]);

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '0',
      margin: '0',
      boxSizing: 'border-box'
    }}>
      <div ref={canvasRef} style={{
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)',
        borderRadius: '0',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a',
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }} />
    </div>
  );
};

export default GameCanvas; 