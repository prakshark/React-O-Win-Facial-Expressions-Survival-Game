import React from 'react';

const Header = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      textAlign: 'center',
      fontFamily: "'Orbitron', sans-serif",
      color: '#00ffff',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
    }}>
      <h1 style={{
        fontSize: '3rem',
        margin: '0',
        fontWeight: '800',
        letterSpacing: '2px',
        background: 'linear-gradient(45deg, #00ffff, #0088ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))'
      }}>
        React-o-Win
      </h1>
      <a 
        href="https://github.com/prakshark" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          fontSize: '1rem',
          color: '#00ffff',
          textDecoration: 'none',
          opacity: '0.8',
          transition: 'opacity 0.3s',
          display: 'block',
          marginTop: '5px',
          ':hover': {
            opacity: '1'
          }
        }}
      >
        @prakshark
      </a>
    </div>
  );
};

export default Header; 