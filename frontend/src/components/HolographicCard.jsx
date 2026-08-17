import React, { useRef, useState } from 'react';

const HolographicCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    
    // Calculate tilt
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
    const tiltY = ((x - centerX) / centerX) * 10;
    
    setTilt({ x: tiltX, y: tiltY });
    
    // Calculate glare (percentage)
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className={`perspective-1000 relative w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={cardRef}
        className="w-full h-full relative transition-transform duration-200 ease-out preserve-3d"
        style={{
          transform: isHovered 
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(20px)` 
            : 'rotateX(0deg) rotateY(0deg) translateZ(0)'
        }}
      >
        {/* The Card Background/Glass */}
        <div className="absolute inset-0 bg-[#0b1120]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Holographic Glare */}
          <div 
            className="absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`
            }}
          />
        </div>

        {/* Content (pushed forward in Z-space) */}
        <div 
          className="relative z-10 w-full h-full transition-transform duration-200 ease-out"
          style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0)' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default HolographicCard;
