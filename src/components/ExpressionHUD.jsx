import React from 'react';

const ExpressionHUD = ({ currentExpression, confidence }) => {
  const getExpressionColor = (expression) => {
    switch (expression) {
      case 'happy':
        return '#4CAF50';
      case 'angry':
        return '#F44336';
      case 'surprised':
        return '#FFC107';
      case 'neutral':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getExpressionEmoji = (expression) => {
    switch (expression) {
      case 'happy':
        return '😊';
      case 'angry':
        return '😠';
      case 'surprised':
        return '😮';
      case 'neutral':
        return '😐';
      default:
        return '😐';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '10px 20px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      <span style={{
        fontSize: '24px'
      }}>
        {getExpressionEmoji(currentExpression)}
      </span>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <span style={{
          color: getExpressionColor(currentExpression),
          fontWeight: 'bold',
          textTransform: 'capitalize'
        }}>
          {currentExpression || 'No Expression'}
        </span>
        <span style={{
          fontSize: '12px',
          color: confidence >= 0.8 ? '#4CAF50' : '#FF9800'
        }}>
          Confidence: {(confidence * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default ExpressionHUD; 