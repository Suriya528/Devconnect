import React, { useRef, useState } from 'react';
import useHapticAudio from '../hooks/useHapticAudio';

const MagneticButton = ({ children, className = '', onClick, as: Component = 'button', to, ...props }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { playTick, playPop } = useHapticAudio();

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    
    // Calculate distance from center
    const x = (clientX - (left + width / 2)) * 0.3; // 0.3 is the magnetic strength
    const y = (clientY - (top + height / 2)) * 0.3;
    
    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playTick();
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleClick = (e) => {
    playPop();
    if (onClick) onClick(e);
  };

  return (
    <div 
      className="gooey-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Component
        ref={buttonRef}
        onClick={handleClick}
        to={to}
        className={`relative transition-transform duration-200 ease-out ${className}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        {...props}
      >
        {children}
        {isHovered && (
          <div className="absolute inset-0 -z-10 bg-indigo-500/20 blur-xl rounded-full" />
        )}
      </Component>
    </div>
  );
};

export default MagneticButton;
