import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const ringRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let currentX = 0;
    let currentY = 0;
    
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const animateRing = () => {
      if (ringRef.current) {
        // Easing factor for trailing effect (0.15 = smooth lag)
        currentX += (mousePosition.x - currentX) * 0.15;
        currentY += (mousePosition.y - currentY) * 0.15;
        
        ringRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(animateRing);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      // Check if hovering over clickable elements
      const isClickable = target.closest('a, button, input, textarea, select, [role="button"], [role="link"]');
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    animateRing();

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition]);

  return (
    <>
      {/* Primary Dot (Instant) */}
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{ 
          transform: `translate3d(${mousePosition.x - 4}px, ${mousePosition.y - 4}px, 0)`,
          transition: 'width 0.2s, height 0.2s, transform 0.1s'
        }}
      />
      
      {/* Trailing Ring (Smooth lag) */}
      <div 
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border border-white/40 transition-all duration-300 ease-out hidden md:flex items-center justify-center ${
          isHovering 
            ? 'w-16 h-16 -ml-8 -mt-8 bg-white/10 backdrop-blur-[2px]' 
            : 'w-8 h-8 -ml-4 -mt-4'
        }`}
      >
        {/* Optional: Add text inside ring when hovering */}
      </div>
    </>
  );
};

export default CustomCursor;
