import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, ArrowLeft, MapPin, ExternalLink, Briefcase, Download, Heart, MessageCircle, FileText } from 'lucide-react';
import useProfile from '../hooks/useProfile';
import useGitHub from '../hooks/useGitHub';
import EditProfileModal from '../components/EditProfileModal';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import AvatarUpload from '../components/AvatarUpload';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import GitHubConnect from '../components/GitHubConnect';
import ContributionGraph from '../components/ContributionGraph';
import GitHubRepos from '../components/GitHubRepos';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import HolographicCard from '../components/HolographicCard';

const GithubSVG = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { profile, posts: profilePosts, loading, updating, error, updateProfile } = useProfile();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [posts, setPosts] = useState(profilePosts);
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [ghConnected, setGhConnected] = useState(!!profile?.githubUsername);

  const {
    repos, contributions, loading: ghLoading,
    importLoading, fetchRepos, fetchContributions,
    importRepos, disconnect: ghDisconnect
  } = useGitHub();

  useEffect(() => {
    setPosts(profilePosts);
  }, [profilePosts]);

  useEffect(() => {
    if (profile?.avatar !== undefined) {
      setAvatar(profile.avatar);
    }
    setGhConnected(!!profile?.githubUsername);
  }, [profile?.avatar, profile?.githubUsername]);

  useEffect(() => {
    if (ghConnected && profile?.githubUsername) {
      fetchRepos();
      fetchContributions();
    }
  }, [ghConnected, profile?.githubUsername, fetchRepos, fetchContributions]);

  const handleUploadSuccess = (newAvatar) => {
    setAvatar(newAvatar);
  };

  const fullName = [profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean).join(' ');

  const toggleLike = useCallback(
    async (postId) => {
      if (!profile?._id) return;
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: (post.likes || []).some(id => id.toString() === profile._id.toString())
                  ? (post.likes || []).filter(id => id.toString() !== profile._id.toString())
                  : [...(post.likes || []), profile._id]
              }
            : post
        )
      );
      try {
        const { data } = await axios.put(`/api/posts/${postId}/like`);
        setPosts((prev) => prev.map((post) => (post._id === postId ? { ...post, likes: data.likes } : post)));
      } catch (err) {
        toast.error('Failed to like post');
      }
    },
    [profile?._id]
  );

  const deletePost = useCallback(
    async (postId) => {
      try {
        await axios.delete(`/api/posts/${postId}`);
        setPosts((prev) => prev.filter((post) => post._id !== postId));
        toast.success('Post deleted');
      } catch (err) {
        toast.error('Failed to delete post');
      }
    },
    []
  );

  const addComment = useCallback(
    async (postId, text) => {
      try {
        const { data } = await axios.post(`/api/posts/${postId}/comments`, { text });
        setPosts((prev) => prev.map((post) => (post._id === postId ? { ...post, comments: data } : post)));
        toast.success('Comment added');
        return true;
      } catch (err) {
        toast.error('Failed to add comment');
        return false;
      }
    },
    []
  );

  const deleteComment = useCallback(
    async (postId, commentId) => {
      try {
        await axios.delete(`/api/posts/${postId}/comments/${commentId}`);
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, comments: (post.comments || []).filter((c) => c._id?.toString() !== commentId?.toString()) }
              : post
          )
        );
        toast.success('Comment deleted');
      } catch (err) {
        toast.error('Failed to delete comment');
      }
    },
    []
  );

  const aiReview = useCallback(
    async (postId) => {
      try {
        const { data } = await axios.post(`/api/ai/review/${postId}`);
        setPosts((prev) => prev.map((post) => (post._id === postId ? { ...post, comments: data.comments } : post)));
        toast.success('AI Review completed ✨');
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || 'AI Review failed');
        return false;
      }
    },
    []
  );

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await axios.delete('/api/user/profile');
      logout();
      toast.success('Account deleted');
      navigate('/register');
    } catch (err) {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06090F] px-4 py-8 pt-32">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 animate-pulse h-64" />
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#06090F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Failed to load profile</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalLikes = posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#06090F] relative overflow-hidden pb-20 pt-24">
      {/* Cyber-Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="cyber-grid" />
        {/* Glow overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-bold bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 w-fit"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Holographic ID Card */}
        <div className="mb-12">
          <HolographicCard className="p-8 sm:p-10">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              
              {/* Profile Info */}
              <div className="flex items-center gap-6">
                <AvatarUpload
                  firstName={profile?.firstName}
                  lastName={profile?.lastName}
                  avatar={avatar}
                  size="xl"
                  onUploadSuccess={handleUploadSuccess}
                  className="shadow-2xl shadow-indigo-500/50"
                />
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-2">{fullName}</h1>
                  <p className="text-indigo-400 font-bold flex items-center gap-2 text-lg">
                    <Briefcase size={18} /> {profile?.role}
                  </p>
                  {profile?.location && (
                    <p className="text-gray-400 text-sm mt-2 flex items-center gap-2 font-medium">
                      <MapPin size={16} /> {profile?.location}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-3 uppercase tracking-widest font-bold">
                    ID // {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                  <Pencil size={16} /> Edit Profile
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 hover:bg-red-900/50 text-red-400 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-gray-300 text-base mt-8 leading-relaxed max-w-3xl">
                {profile.bio}
              </p>
            )}

            {/* Neon Skills */}
            {profile?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-8">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-2 bg-[#06090F] border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  >
                    {skill.name}
                    {skill.endorsementCount > 0 && (
                      <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full text-xs">
                        {skill.endorsementCount}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Social Links */}
            {(profile?.github || profile?.portfolio || profile?.linkedin) && (
              <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-white/10">
                {profile?.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-indigo-400 font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                    <GithubSVG size={18} /> GitHub
                  </a>
                )}
                {profile?.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-purple-400 font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                    <ExternalLink size={18} /> Portfolio
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-blue-400 font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                    <ExternalLink size={18} /> LinkedIn
                  </a>
                )}
              </div>
            )}
          </HolographicCard>
        </div>

        {/* Bento Stats & GitHub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Stats Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#0b1120] rounded-3xl p-6 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0"><FileText size={24} /></div>
              <div><p className="text-white font-black text-2xl">{posts.length}</p><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Posts</p></div>
            </div>
            <div className="bg-[#0b1120] rounded-3xl p-6 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0"><Heart size={24} /></div>
              <div><p className="text-white font-black text-2xl">{totalLikes}</p><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Likes Received</p></div>
            </div>
            <div className="bg-[#0b1120] rounded-3xl p-6 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"><MessageCircle size={24} /></div>
              <div><p className="text-white font-black text-2xl">{totalComments}</p><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Comments</p></div>
            </div>
          </div>

          {/* GitHub Activity Bento */}
          <div className="lg:col-span-2 bg-[#0b1120] rounded-3xl p-8 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><GithubSVG size={20} /></div>
                <div>
                  <h3 className="text-white font-bold text-lg">GitHub Activity</h3>
                  <p className="text-gray-400 text-sm">Sync your repos and contributions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <GitHubConnect
                  githubUsername={ghConnected ? profile?.githubUsername : null}
                  onDisconnect={async () => {
                    const ok = await ghDisconnect();
                    if (ok) setGhConnected(false);
                  }}
                />
                {ghConnected && (
                  <button
                    onClick={async () => {
                      const newPosts = await importRepos();
                      if (newPosts?.length) setPosts((prev) => [...newPosts, ...prev]);
                    }}
                    disabled={importLoading}
                    className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  >
                    <Download size={16} /> {importLoading ? 'Importing...' : 'Import to Feed'}
                  </button>
                )}
              </div>
            </div>

            {ghConnected ? (
              <div className="flex flex-col gap-8">
                <ContributionGraph data={contributions} loading={ghLoading} />
                <GitHubRepos repos={repos} loading={ghLoading} />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-500 font-medium">Connect your GitHub to display activity here.</p>
              </div>
            )}
          </div>

        </div>

        {/* My Posts Grid */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter">My Timeline</h2>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-bold">{posts.length}</span>
          </div>

          {posts.length === 0 ? (
            <EmptyState title="No posts yet" description="Share something on the feed to start your timeline!" />
          ) : (
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {posts.map((post) => (
                <div key={post._id} className="break-inside-avoid">
                  <PostCard
                    post={post}
                    onLike={toggleLike}
                    onDelete={deletePost}
                    onAddComment={addComment}
                    onDeleteComment={deleteComment}
                    onAiReview={aiReview}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {showModal && (
        <EditProfileModal
          profile={profile}
          updating={updating}
          onSave={async (data) => {
            const success = await updateProfile(data);
            if (success) setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone."
          confirmLabel={deleting ? 'Deleting...' : 'Delete Account'}
          cancelLabel="Cancel"
          danger
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;