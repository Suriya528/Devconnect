import React from 'react';

const NoiseOverlay = () => {
  return (
    <>
      <svg className="fixed pointer-events-none opacity-0 w-0 h-0 z-[-1]">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.75" 
            numOctaves="3" 
            stitchTiles="stitch"
          />
        </filter>
      </svg>
      <div 
        className="fixed inset-0 pointer-events-none z-[9997] opacity-[0.03] animate-noise"
        style={{ 
          filter: 'url(#noiseFilter)',
          mixBlendMode: 'overlay',
          // Make it slightly larger than viewport so animation doesn't show edges
          width: '110vw',
          height: '110vh',
          left: '-5vw',
          top: '-5vh'
        }}
      />
    </>
  );
};

export default NoiseOverlay;
