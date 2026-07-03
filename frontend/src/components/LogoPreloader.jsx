import React from 'react';
import './LogoPreloader.css';

const LogoPreloader = ({ isLoading = true, size = 'medium', text = 'Loading...' }) => {
  if (!isLoading) return null;

  const sizeClasses = {
    small: 'logo-preloader--small',
    medium: 'logo-preloader--medium',
    large: 'logo-preloader--large',
  };

  return (
    <div className="logo-preloader-container">
      <div className={`logo-preloader ${sizeClasses[size]}`}>
        {/* Animated Logo SVG */}
        <div className="logo-preloader__fill">
          <img 
            src="/images/logo/logo.svg" 
            alt="Sallah Sanjal" 
            className="logo-preloader__logo-svg"
          />
        </div>

        {/* Shimmer Effect */}
        <div className="logo-preloader__shimmer"></div>
      </div>

      {/* Loading Text */}
      {text && <p className="logo-preloader__text">{text}</p>}
    </div>
  );
};

export default LogoPreloader;
