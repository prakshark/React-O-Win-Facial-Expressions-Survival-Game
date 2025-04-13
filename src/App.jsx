import { useState, useEffect } from 'react'
import GameCanvas from './components/GameCanvas'
import ExpressionHUD from './components/ExpressionHUD'
import useFaceExpression from './hooks/useFaceExpression'
import { getActionFromExpression } from './utils/expressionMapper'
import './App.css'
import Header from './components/Header'

function App() {
  const { currentExpression, expressionConfidence, isLoading, error } = useFaceExpression()
  const [gameState, setGameState] = useState({
    isPlaying: false,
    score: 0
  })
  const [currentAction, setCurrentAction] = useState(null)

  useEffect(() => {
    // Add Orbitron font
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;800&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    if (currentExpression && expressionConfidence >= 0.3) {
      console.log('App: Processing new expression:', {
        expression: currentExpression,
        confidence: expressionConfidence
      })
      
      if (!gameState.isPlaying) {
        console.log('App: Starting game...')
        setGameState(prev => ({ ...prev, isPlaying: true }))
      }

      const action = getActionFromExpression(currentExpression, expressionConfidence)
      console.log('App: Generated action:', action)
      setCurrentAction(action)
    }
  }, [currentExpression, expressionConfidence, gameState.isPlaying])

  const handleExpressionDetected = () => {
    console.log('App: Returning current action:', currentAction)
    return currentAction
  }

  if (isLoading) {
    console.log('App: Loading face detection...')
    return (
      <div className="loading-screen">
        Loading facial expression detection...
      </div>
    )
  }

  if (error) {
    console.error('App: Error in face detection:', error)
    return (
      <div className="error-screen">
        Error: {error}
      </div>
    )
  }

  console.log('App: Current state:', {
    expression: currentExpression,
    confidence: expressionConfidence,
    gameState,
    currentAction
  })

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      <Header />
      <GameCanvas onExpressionDetected={handleExpressionDetected} />
      <ExpressionHUD currentExpression={currentExpression} confidence={expressionConfidence} />
      {!gameState.isPlaying && (
        <div className="start-screen">
          <h1>ReactoWin</h1>
          <p>Use your facial expressions to play!</p>
          <p>😊 Jump | 😠 Duck | 😮 Dash | 😐 Idle</p>
          <p>Make a face to start!</p>
        </div>
      )}
    </div>
  )
}

export default App
