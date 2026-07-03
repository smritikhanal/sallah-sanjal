import React, { useState } from 'react';

const Tooltip = ({ text, children, position = 'top', className = '' }) => {
  const [visible, setVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-800',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onTouchStart={(e) => { e.preventDefault(); setVisible(!visible); }}
      role="presentation"
    >
      {children}
      {visible && text && (
        <div
          role="tooltip"
          aria-hidden={!visible}
          className={`absolute z-50 ${positionStyles[position]} pointer-events-none`}
        >
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 max-w-48 text-center leading-snug shadow-lg">
            {text}
          </div>
          <div className={`absolute w-0 h-0 ${arrowStyles[position]}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
