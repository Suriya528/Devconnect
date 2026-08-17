import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Briefcase } from 'lucide-react';

const DeveloperCard = ({ developer }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Handle both flat and nested name structures
  const firstName = developer.firstName || developer.name?.firstName;
  const middleName = developer.middleName || developer.name?.middleName;
  const lastName = developer.lastName || developer.name?.lastName;

  const fullName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(' ');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={"View profile of " + (fullName || 'Unknown User')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/developers/' + developer._id); } }}
      onClick={() => navigate(`/developers/${developer._id}`)}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] animate-fade-in-up bg-[#0b1120] border border-white/5"
    >
      {/* Mouse Tracking Spotlight Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
        }}
      />
      
      {/* Card Content (Glassmorphic) */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-center bg-white/5 backdrop-blur-sm m-[1px] rounded-2xl">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div 
            className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-500 group-hover:scale-110 flex-shrink-0 border-2 border-white/10 group-hover:border-white/20 glitch-hover"
            data-text={`${firstName?.[0] || '?'}${lastName?.[0] || ''}`}
          >
            {firstName?.[0] || '?'}{lastName?.[0] || ''}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-purple-300 transition-all">
              {fullName || 'Unknown User'}
            </h3>
            
            <div className="flex items-center gap-1.5 mt-1">
              <Briefcase size={12} className="text-indigo-400 flex-shrink-0" />
              <p className="text-indigo-300 text-sm truncate font-medium">{developer.role || 'Developer'}</p>
            </div>
            
            {developer.location && (
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin size={12} className="text-gray-500 flex-shrink-0" />
                <p className="text-gray-400 text-xs truncate">{developer.location}</p>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/50">
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCard;