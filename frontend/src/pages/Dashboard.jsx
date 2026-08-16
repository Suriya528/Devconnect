import { useState, useCallback } from 'react';
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
  User
} from 'lucide-react';

const SuggestedDeveloperCard = ({ dev, onNavigate }) => {
  const { following, loading: followLoading, toggleFollow } = useFollow(dev._id);
  const firstName = dev.firstName || dev.name?.firstName;
  const lastName = dev.lastName || dev.name?.lastName;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    await toggleFollow();
  };

  return (
    <div
      onClick={() => onNavigate(dev._id)}
      className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-blue-600 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {firstName?.[0]}{lastName?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{fullName || 'Unknown'}</p>
          <p className="text-blue-400 text-xs truncate">{dev.role}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-orange-400 text-xs">
          <Star size={14} />
          <span className="font-semibold">{dev.devScore || 0}</span>
        </div>
        <button
          onClick={handleFollowClick}
          disabled={followLoading}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            following
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <UserPlus size={12} />
          {following ? 'Unfollow' : 'Follow'}
        </button>
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

const SkeletonCard = () => (
  <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-gray-700" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="w-20 h-4 bg-gray-700 rounded" />
        <div className="w-32 h-3 bg-gray-800 rounded" />
      </div>
    </div>
    <div className="w-full h-3 bg-gray-800 rounded mb-2" />
    <div className="w-3/4 h-3 bg-gray-800 rounded" />
  </div>
);

const StatCard = ({ icon: Icon, value, label, accent }) => (
  <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-white font-bold text-2xl">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, trendingPosts, suggestedDevs, loading, stats } = useDashboard();

  const firstName = profile?.firstName || user?.firstName || 'User';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="w-48 h-8 bg-gray-800 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-700 mb-3" />
                <div className="w-16 h-6 bg-gray-700 rounded mb-2" />
                <div className="w-24 h-4 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Welcome Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-gray-400 text-sm">{formatDate()}</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`
            )}
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={FileText}
            value={stats.totalPosts}
            label="Total Posts"
            accent="bg-blue-600"
          />
          <StatCard
            icon={Heart}
            value={stats.totalLikes}
            label="Likes Received"
            accent="bg-pink-600"
          />
          <StatCard
            icon={Users}
            value={stats.followersCount}
            label="Followers"
            accent="bg-green-600"
          />
          <StatCard
            icon={Star}
            value={stats.devScore}
            label="Dev Score"
            accent="bg-orange-600"
          />
        </div>

        {/* Trending Posts Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-orange-400" size={20} />
            <h2 className="text-xl font-bold text-white">Trending This Week 🔥</h2>
          </div>
          {trendingPosts.length === 0 ? (
            <p className="text-gray-500 text-sm">No trending posts yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingPosts.slice(0, 3).map((post) => {
                const postUser = post.name || {};
                const postUserName = postUser.name || {};
                const fullName = [
                  postUserName.firstName || postUser.firstName,
                  postUserName.middleName || postUser.middleName,
                  postUserName.lastName || postUser.lastName
                ].filter(Boolean).join(' ');

                return (
                  <Link
                    key={post._id}
                    to={`/posts/${post._id}`}
                    className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-blue-600 transition-colors block"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(postUserName.firstName || postUser.firstName)?.[0]}
                        {(postUserName.lastName || postUser.lastName)?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{fullName || 'Unknown User'}</p>
                        <p className="text-gray-400 text-xs truncate">{postUser.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                      {post.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Heart size={14} />
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      {post.techStack?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {post.techStack.slice(0, 2).map((tech, i) => (
                            <span
                              key={i}
                              className="bg-gray-800 text-blue-400 text-[10px] px-2 py-0.5 rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Suggested Developers Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-400" size={20} />
            <h2 className="text-xl font-bold text-white">Developers to Follow</h2>
          </div>
          {suggestedDevs.length === 0 ? (
            <p className="text-gray-500 text-sm">No suggestions right now</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestedDevs.map((dev) => (
                <SuggestedDeveloperCard
                  key={dev._id}
                  dev={dev}
                  onNavigate={(id) => navigate(`/developers/${id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions Row */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/feed"
              className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-blue-600 transition-colors flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PenSquare size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Create Post</p>
                <p className="text-gray-400 text-xs">Share something new</p>
              </div>
            </Link>
            <Link
              to="/search"
              className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-purple-600 transition-colors flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Search Developers</p>
                <p className="text-gray-400 text-xs">Find talent by skill</p>
              </div>
            </Link>
            <Link
              to="/profile"
              className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-green-600 transition-colors flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">My Profile</p>
                <p className="text-gray-400 text-xs">View and edit profile</p>
              </div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
