import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Code2 } from 'lucide-react';
import CanvasBackground from '../components/CanvasBackground';
import MagneticButton from '../components/MagneticButton';

const TechLogo = ({ name }) => (
  <div className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors cursor-default mx-8">
    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
      <span className="font-mono font-bold">{name[0]}</span>
    </div>
    <span className="text-2xl font-black font-mono tracking-tighter">{name}</span>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      
      const MAX_TILT = 5;
      
      setTilt({
        x: -y * MAX_TILT,
        y: x * MAX_TILT,
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Tech stack for marquee
  const techStack = ['React', 'Node.js', 'Vite', 'MongoDB', 'Express', 'Tailwind', 'Redux', 'TypeScript'];
  // Duplicate for seamless loop
  const marqueeContent = [...techStack, ...techStack];

  return (
    <div className="min-h-screen bg-[#06090F] relative overflow-hidden flex items-center justify-center px-4 perspective-1000">
      
      {/* Interactive Constellation Canvas */}
      <CanvasBackground />

      {/* Dynamic Background Glow Orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] transition-transform duration-1000 ease-out pointer-events-none"
        style={{ transform: `translate(${tilt.y * -5}px, ${tilt.x * 5}px)` }}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] transition-transform duration-1000 ease-out pointer-events-none"
        style={{ transform: `translate(${tilt.y * 5}px, ${tilt.x * -5}px)` }}
      ></div>

      <div 
        ref={containerRef}
        className="relative z-10 text-center max-w-5xl mx-auto opacity-0 animate-fade-in-up transition-transform duration-200 ease-out preserve-3d mt-10"
        style={{ 
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`
        }}
      >
        {/* Floating Badge */}
        <div 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-transform duration-300"
          style={{ transform: 'translateZ(40px)' }}
        >
          <Code2 className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold tracking-wide text-gray-300 uppercase">The premier platform for developers</span>
        </div>

        {/* 3D Hero Title */}
        <h1 
          className="text-6xl md:text-[6rem] font-black text-white leading-[1.1] tracking-tighter mb-8 drop-shadow-2xl transition-transform duration-300"
          style={{ transform: 'translateZ(80px)' }}
        >
          Connect, Build, and <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-shimmer bg-[length:200%_auto]">
            Scale Together
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p 
          className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed transition-transform duration-300"
          style={{ transform: 'translateZ(60px)' }}
        >
          Join a thriving community of developers. Share your projects, find collaborators, 
          and grow your network in a space built exclusively for you.
        </p>

        {/* CTA Buttons (Magnetic) */}
        <div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center transition-transform duration-300"
          style={{ transform: 'translateZ(100px)' }}
        >
          {user ? (
            <MagneticButton
              as={Link}
              to="/dashboard"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-white/10 border border-white/20 rounded-2xl overflow-hidden backdrop-blur-xl hover:shadow-[0_0_60px_-10px_rgba(99,102,241,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-3">
                Go to Dashboard
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </MagneticButton>
          ) : (
            <>
              <MagneticButton
                as={Link}
                to="/register"
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden hover:shadow-[0_0_60px_-10px_rgba(99,102,241,0.5)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Get Started for Free
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </MagneticButton>
              
              <MagneticButton
                as={Link}
                to="/login"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-gray-300 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl hover:bg-white/10 hover:text-white"
              >
                Sign In
              </MagneticButton>
            </>
          )}
        </div>

        {/* Infinite Marquee Social Proof */}
        <div 
          className="mt-32 pt-12 border-t border-white/5 flex flex-col items-center opacity-70 transition-transform duration-300 w-screen relative left-1/2 -translate-x-1/2 overflow-hidden"
          style={{ transform: 'translateZ(20px) translateX(-50%)' }}
        >
          <p className="text-sm text-gray-500 font-bold mb-8 tracking-widest uppercase relative z-20 bg-[#06090F] px-4">Powered by modern tech</p>
          
          <div className="relative w-full flex overflow-hidden">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#06090F] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#06090F] to-transparent z-10"></div>
            
            <div className="flex w-[200%] animate-marquee">
              <div className="flex w-1/2 justify-around items-center">
                {techStack.map((tech, i) => (
                  <TechLogo key={`first-${i}`} name={tech} />
                ))}
              </div>
              <div className="flex w-1/2 justify-around items-center">
                {techStack.map((tech, i) => (
                  <TechLogo key={`second-${i}`} name={tech} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;