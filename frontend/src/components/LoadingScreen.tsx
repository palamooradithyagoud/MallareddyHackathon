import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Analyzing data", subMessage = "Please wait a moment..." }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Glowing backgrounds */}
        <div className="absolute h-36 w-36 rounded-full bg-primary/25 blur-xl animate-pulse-slow"></div>
        <div className="absolute h-36 w-36 rounded-full bg-secondary/20 blur-2xl animate-ping" style={{ animationDuration: '3s' }}></div>

        {/* Core spinner ring */}
        <div className="h-24 w-24 rounded-full border-4 border-t-accent border-r-secondary border-b-primary border-l-transparent animate-spin"></div>
        
        {/* Center dot */}
        <div className="absolute h-6 w-6 rounded-full bg-gradient-button shadow-glow-primary"></div>
      </div>

      <div className="mt-8 text-center px-4">
        <h2 className="text-2xl font-bold text-text-primary tracking-wide">
          {message}{dots}
        </h2>
        <p className="mt-2 text-sm text-text-secondary animate-pulse-slow">
          {subMessage}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
