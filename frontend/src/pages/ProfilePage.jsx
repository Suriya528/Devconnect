import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, ArrowLeft, MapPin, ExternalLink, Briefcase } from 'lucide-react';
import useProfile from '../hooks/useProfile';
import EditProfileModal from '../components/EditProfileModal';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import AvatarUpload from '../components/AvatarUpload';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { profile, posts: profilePosts, loading, updating, error, updateProfile } = useProfile();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [posts, setPosts] = useState(profilePosts);
  const [avatar, setAvatar] = useState(profile?.avatar || '');

  // Sync posts when profilePosts changes
  useEffect(() => {
    setPosts(profilePosts);
  }, [profilePosts]);

  useEffect(() => {
    if (profile?.avatar !== undefined) {
      setAvatar(profile.avatar);
    }
  }, [profile?.avatar]);

  const handleUploadSuccess = (newAvatar) => {
    setAvatar(newAvatar);
  };

  const fullName = [
    profile?.firstName,
    profile?.middleName,
    profile?.lastName
  ]
    .filter(Boolean)
    .join(' ');

  const toggleLike = useCallback(
    async (postId) => {
      if (!profile?._id) return;
      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: (post.likes || []).some(
                  (likeId) => likeId.toString() === profile._id.toString()
                )
                  ? (post.likes || []).filter(
                      (likeId) => likeId.toString() !== profile._id.toString()
                    )
                  : [...(post.likes || []), profile._id]
              }
            : post
        )
      );

      try {
        const { data } = await axios.put(`/api/posts/${postId}/like`);
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, likes: data.likes } : post
          )
        );
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
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, comments: data } : post
          )
        );
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
              ? {
                  ...post,
                  comments: (post.comments || []).filter((c) => c._id?.toString() !== commentId?.toString())
                }
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
      <div className="min-h-screen bg-gray-950 px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-700" />
              <div className="flex flex-col gap-3 flex-1">
                <div className="w-40 h-4 bg-gray-700 rounded" />
                <div className="w-28 h-3 bg-gray-800 rounded" />
              </div>
            </div>
          </div>
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Failed to load profile</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Profile card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">

            {/* Left — avatar + info */}
            <div className="flex items-center gap-5 flex-wrap">
              <AvatarUpload
                firstName={profile?.firstName}
                lastName={profile?.lastName}
                avatar={avatar}
                size="xl"
                onUploadSuccess={handleUploadSuccess}
              />
              <div>
                <h1 className="text-xl font-bold text-white">{fullName}</h1>
                <p className="text-blue-400 mt-1 flex items-center gap-1.5">
                  <Briefcase size={14} />
                  {profile?.role}
                </p>
                {profile?.location && (
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
                    <MapPin size={14} />
                    {profile?.location}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Joined{' '}
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>

            {/* Right — actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 border border-red-800 hover:bg-red-900/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-gray-300 text-sm mt-4 leading-relaxed">{profile.bio}</p>
          )}

          {/* Skills */}
          {profile?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-gray-800 text-blue-400 text-xs px-3 py-1 rounded-full"
                >
                  {skill.name}
                  {skill.endorsementCount > 0 && (
                    <span className="ml-1.5 text-blue-300">
                      {skill.endorsementCount} 👍
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          {(profile?.github || profile?.portfolio || profile?.linkedin) && (
            <div className="flex flex-wrap gap-4 mt-4">
              {profile?.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <ExternalLink size={16} />
                  GitHub
                </a>
              )}
              {profile?.portfolio && (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <ExternalLink size={16} />
                  Portfolio
                </a>
              )}
              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <ExternalLink size={16} />
                  LinkedIn
                </a>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-white font-bold text-xl">{posts.length}</p>
              <p className="text-gray-400 text-sm">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl">
                {posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0)}
              </p>
              <p className="text-gray-400 text-sm">Likes received</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl">
                {posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0)}
              </p>
              <p className="text-gray-400 text-sm">Comments received</p>
            </div>
          </div>
        </div>

        {/* My posts */}
        <h2 className="text-white font-semibold mb-4">
          My Posts ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Share something on the feed!"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={toggleLike}
                onDelete={deletePost}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
              />
            ))}
          </div>
        )}

      </div>

      {/* Edit modal */}
      {showModal && (
        <EditProfileModal
          profile={profile}
          updating={updating}
          onSave={async (data) => {
            const success = await updateProfile(data);
            if (success) {
              setShowModal(false);
            }
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone and all your posts will be removed."
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