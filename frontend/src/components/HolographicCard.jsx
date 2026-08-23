import React, { useRef, useState } from 'react';
import useGyroscope from '../hooks/useGyroscope';

const HolographicCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const gyroTilt = useGyroscope(2);
  const [isHovered, setIsHovered] = useState(false);

  let ticking = useRef(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current || ticking.current) return;
    
    ticking.current = true;
    const clientX = e.clientX;
    const clientY = e.clientY;

    window.requestAnimationFrame(() => {
      if (!cardRef.current) {
        ticking.current = false;
        return;
      }
      const rect = cardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const tiltX = ((y - centerY) / centerY) * -10;
      const tiltY = ((x - centerX) / centerX) * 10;
      
      setTilt({ x: tiltX, y: tiltY });
      
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100
      });
      ticking.current = false;
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const rotateX = isHovered ? tilt.x : gyroTilt.x;
  const rotateY = isHovered ? tilt.y : gyroTilt.y;

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
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${isHovered ? '20px' : '0px'})`
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

export default React.memo(HolographicCard);
