import React from 'react';

const AnimatedLogo = ({ className = '', size = 40, style = {} }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={style}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="v-glow"
      >
        <path
          d="M 20 20 L 35 25 L 28 33 L 50 70 L 72 33 L 65 25 L 80 20 L 50 85 Z"
          className="drop-shadow-lg"
        />
      </svg>
    </div>
  );
};

export default AnimatedLogo;