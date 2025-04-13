const expressionToAction = {
  happy: 'jump',
  angry: 'duck',
  surprised: 'dash',
  neutral: 'idle'
};

export const mapExpressionToAction = (expression, confidence) => {
  // Lowered threshold to 30% for easier triggering
  if (confidence >= 0.3) {
    return expressionToAction[expression] || 'idle';
  }
  return 'idle';
};

export const getActionFromExpression = (expression, confidence) => {
  const action = mapExpressionToAction(expression, confidence);
  return {
    type: action,
    timestamp: Date.now(),
    confidence: confidence
  };
}; 