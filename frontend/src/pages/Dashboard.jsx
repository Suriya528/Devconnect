import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDashboard from '../hooks/useDashboard';
import useFollow from '../hooks/useFollow';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Heart,
  Users,
  Star,
  Sparkles,
  TrendingUp,
  UserPlus,
  PenSquare,
  Search,
  User,
  ArrowRight,
  Activity
} from 'lucide-react';

const SuggestedDeveloperCard = ({ dev, onNavigate }) => {
  const { following, loading: followLoading, toggleFollow } = useFollow(dev._id);
  const firstName = dev.firstName || dev.name?.firstName;
  const lastName = dev.lastName || dev.name?.lastName;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    await toggleFollow();
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate(dev._id)}
      className="group relative bg-[#0b1120] rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden shadow-lg animate-fade-in-up"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.15), transparent 40%)`,
        }}
      />
      
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
            {firstName?.[0]}{lastName?.[0]}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full text-orange-400 text-xs font-bold">
            <Star size={12} className="fill-orange-400" />
            <span>{dev.devScore || 0}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-white text-base font-bold truncate group-hover:text-purple-300 transition-colors">{fullName || 'Unknown'}</p>
          <p className="text-gray-400 text-xs font-medium truncate mt-0.5">{dev.role}</p>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <button
            onClick={handleFollowClick}
            disabled={followLoading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              following
                ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                : 'bg-white/10 text-white hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25'
            } disabled:opacity-50 z-20 relative`}
          >
            <UserPlus size={16} />
            {following ? 'Following' : 'Follow Developer'}
          </button>
        </div>
      </div>
    </div>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const SkeletonBento = () => (
  <div className="min-h-screen bg-[#06090F] px-4 py-8">
    <div className="max-w-7xl mx-auto">
      <div className="w-64 h-12 bg-white/5 rounded-xl mb-8 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 h-[800px]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`bg-white/5 rounded-3xl border border-white/5 animate-pulse relative overflow-hidden ${i === 1 ? 'md:col-span-2 md:row-span-2' : i === 2 ? 'md:col-span-2' : ''}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BentoStat = ({ icon: Icon, value, label, gradientClass, colSpan = "col-span-1" }) => (
  <div className={`${colSpan} group relative bg-[#0b1120] rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all overflow-hidden flex flex-col justify-between`}>
    <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${gradientClass} rounded-full opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-1000`}></div>
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientClass} p-[1px] mb-6 relative z-10 shadow-lg`}>
      <div className="w-full h-full bg-[#0b1120] rounded-2xl flex items-center justify-center group-hover:bg-transparent transition-colors duration-500">
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="relative z-10 mt-auto">
      <p className="text-white font-black text-4xl tracking-tighter mb-1">{value}</p>
      <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, trendingPosts, suggestedDevs, loading, stats } = useDashboard();
  const firstName = profile?.firstName || user?.firstName || 'User';

  if (loading) return <SkeletonBento />;

  return (
    <div className="min-h-screen bg-[#06090F] px-4 py-8 relative overflow-hidden selection:bg-purple-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-purple-900/20 via-indigo-900/10 to-transparent rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-900/20 to-transparent rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">
              <Activity size={16} />
              <span>Dashboard Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              {getGreeting()}, <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#a78bfa,45%,#e879f9,55%,#a78bfa)] bg-[length:200%_auto] animate-shimmer">{firstName}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-full border border-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-[#06090F] flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {profile?.firstName?.[0] || ''}{profile?.lastName?.[0] || ''}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{firstName} {profile?.lastName}</p>
              <p className="text-gray-400 text-xs font-medium">{formatDate()}</p>
            </div>
          </div>
        </div>

        {/* Bento Grid Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[240px] gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Main Trending Post (Spans 2 cols, 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 group relative bg-[#0b1120] rounded-3xl p-8 border border-white/5 hover:border-indigo-500/50 transition-all overflow-hidden flex flex-col shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest">
                <TrendingUp size={14} />
                Top Trending
              </div>
              <Link to="/feed" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all">
                <ArrowRight size={18} className="-rotate-45" />
              </Link>
            </div>

            {trendingPosts[0] ? (
              <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {(trendingPosts[0].name?.name?.firstName || trendingPosts[0].name?.firstName)?.[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{trendingPosts[0].name?.name?.firstName || trendingPosts[0].name?.firstName} {trendingPosts[0].name?.name?.lastName || trendingPosts[0].name?.lastName}</p>
                    <p className="text-gray-400 text-sm">{trendingPosts[0].name?.role}</p>
                  </div>
                </div>
                <p className="text-gray-200 text-xl md:text-2xl font-medium leading-relaxed mb-6 line-clamp-3">
                  "{trendingPosts[0].text}"
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex gap-2">
                    {trendingPosts[0].techStack?.slice(0, 3).map((tech, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-white text-xs font-bold border border-white/5">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-pink-400 font-bold bg-pink-500/10 px-4 py-2 rounded-xl">
                    <Heart size={18} className="fill-pink-400" />
                    <span>{trendingPosts[0].likes?.length || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <Sparkles size={48} className="mb-4 opacity-20" />
                <p>No trending posts yet.</p>
              </div>
            )}
          </div>

          {/* Quick Actions (Spans 2 cols, 1 row) */}
          <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <Link to="/feed" className="group relative bg-[#0b1120] rounded-3xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all overflow-hidden flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                <PenSquare size={24} />
              </div>
              <div>
                <p className="text-white font-bold text-xl mb-1">Create Post</p>
                <p className="text-gray-400 text-sm">Share an update</p>
              </div>
            </Link>
            <Link to="/search" className="group relative bg-[#0b1120] rounded-3xl p-6 border border-white/5 hover:border-purple-500/30 transition-all overflow-hidden flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all shadow-lg">
                <Search size={24} />
              </div>
              <div>
                <p className="text-white font-bold text-xl mb-1">Discover</p>
                <p className="text-gray-400 text-sm">Find top talent</p>
              </div>
            </Link>
          </div>

          {/* Stats Bento Cards */}
          <BentoStat icon={Heart} value={stats.totalLikes} label="Total Likes" gradientClass="from-pink-500 to-rose-500" />
          <BentoStat icon={Users} value={stats.followersCount} label="Followers" gradientClass="from-emerald-400 to-teal-500" />
          <BentoStat icon={Star} value={stats.devScore} label="Dev Score" gradientClass="from-orange-400 to-amber-500" />
          <BentoStat icon={FileText} value={stats.totalPosts} label="Posts" gradientClass="from-blue-500 to-cyan-500" />

        </div>

        {/* Suggested Developers Grid */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white tracking-tighter">Expand Your Network</h2>
            <Link to="/search" className="text-purple-400 hover:text-purple-300 text-sm font-bold flex items-center gap-1 uppercase tracking-widest transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestedDevs.slice(0, 4).map((dev) => (
              <SuggestedDeveloperCard
                key={dev._id}
                dev={dev}
                onNavigate={(id) => navigate(`/developers/${id}`)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
