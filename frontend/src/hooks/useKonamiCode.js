import { useEffect, useState } from 'react';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];

const useKonamiCode = (callback) => {
  const [sequence, setSequence] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      // Allow uppercase B and A as well
      const normalizedKey = (key === 'B' || key === 'A') ? key.toLowerCase() : key;

      setSequence((prev) => {
        const nextSequence = [...prev, normalizedKey];
        // Only keep the last N keys where N is the length of Konami code
        if (nextSequence.length > KONAMI_CODE.length) {
          nextSequence.shift();
        }

        // Check if sequences match
        if (nextSequence.join(',') === KONAMI_CODE.join(',')) {
          if (callback) callback();
          return []; // Reset after trigger
        }

        return nextSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
};

export default useKonamiCode;
