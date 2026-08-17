import { useState, useEffect } from 'react';

const useGyroscope = (multiplier = 1) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleOrientation = (e) => {
      // beta is front-to-back tilt in degrees, where front is positive (-180 to 180)
      // gamma is left-to-right tilt in degrees, where right is positive (-90 to 90)
      let { beta, gamma } = e;

      // Limit the values so the parallax doesn't flip entirely
      if (beta > 45) beta = 45;
      if (beta < -45) beta = -45;
      if (gamma > 45) gamma = 45;
      if (gamma < -45) gamma = -45;

      // Map to roughly -10 to 10 degrees for visual tilt
      setTilt({
        x: (beta / 45) * 10 * multiplier,
        y: (gamma / 45) * 10 * multiplier
      });
    };

    // Need to request permission on iOS 13+ if possible, but for simplicity we just add listener.
    // In a real prod app, a user gesture button might be needed to trigger DeviceOrientationEvent.requestPermission()
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [multiplier]);

  return tilt;
};

export default useGyroscope;
