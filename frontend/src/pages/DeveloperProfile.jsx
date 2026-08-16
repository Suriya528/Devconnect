import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ExternalLink, Briefcase, Star, GitBranch, Link as LinkIcon, ThumbsUp, UserPlus, UserMinus } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import useDeveloper from '../hooks/useDeveloper';
import useFollow from '../hooks/useFollow';
import useEndorse from '../hooks/useEndorse';
import useGitHub from '../hooks/useGitHub';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import FollowListModal from '../components/FollowListModal';
import ContributionGraph from '../components/ContributionGraph';
import GitHubRepos from '../components/GitHubRepos';
import { useAuth } from '../context/AuthContext';

const SkillChip = ({ skill, developerId, isOwnProfile }) => {
  const { endorsed, count, loading, toggleEndorse } = useEndorse(
    developerId,
    skill.name,
    false,
    skill.endorsementCount || 0
  );

  return (
    <button
      onClick={() => !isOwnProfile && toggleEndorse()}
      disabled={isOwnProfile || loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        endorsed
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {skill.name}
      <span className="flex items-center gap-0.5">
        <ThumbsUp size={10} />
        {count}
      </span>
    </button>
  );
};

const DeveloperProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { developer, posts: devPosts, loading, error } = useDeveloper(id);
  const [posts, setPosts] = useState(devPosts);
  const [developerData, setDeveloperData] = useState(developer);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const { following, loading: followLoading, toggleFollow, checkFollowing } = useFollow(id);

  const isOwnProfile = user?._id === id;

  const {
    repos: ghRepos, contributions: ghContributions,
    loading: ghLoading, fetchRepos, fetchContributions
  } = useGitHub();

  useEffect(() => {
    setPosts(devPosts);
  }, [devPosts]);

  useEffect(() => {
    setDeveloperData(developer);
    if (developer?.followers && user?._id) {
      checkFollowing(user._id, developer.followers);
    }
    // Fetch GitHub data if developer has GitHub connected
    if (developer?.githubUsername) {
      fetchRepos(developer.githubUsername);
      fetchContributions(developer.githubUsername);
    }
  }, [developer, checkFollowing, user?._id, fetchRepos, fetchContributions]);

  const fullName = [
    developerData?.firstName,
    developerData?.middleName,
    developerData?.lastName
  ]
    .filter(Boolean)
    .join(' ');

  const handleToggleFollow = useCallback(async () => {
    await toggleFollow((isFollowing) => {
      setDeveloperData((prev) => {
        if (!prev) return prev;
        const currentUserId = user._id;
        const isCurrentlyFollowing = prev.followers?.some(
          (fid) => fid.toString() === currentUserId.toString()
        );

        return {
          ...prev,
          followers: isFollowing
            ? prev.followers?.filter((fid) => fid.toString() !== currentUserId.toString()) || []
            : [...(prev.followers || []), currentUserId],
          following: isFollowing
            ? prev.following?.filter((fid) => fid.toString() !== currentUserId.toString()) || []
            : [...(prev.following || []), currentUserId]
        };
      });
    });
  }, [toggleFollow, user?._id]);

  const toggleLike = useCallback(
    async (postId) => {
      if (!user) return;
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes?.some(
                  (likeId) => likeId.toString() === user._id.toString()
                )
                  ? post.likes.filter(
                      (likeId) => likeId.toString() !== user._id.toString()
                    )
                  : [...(post.likes || []), user._id]
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
    [user]
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
                  comments: post.comments?.filter(
                    (c) => c._id?.toString() !== commentId?.toString()
                  )
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

  const aiReview = useCallback(
    async (postId) => {
      try {
        const { data } = await axios.post(`/api/ai/review/${postId}`);
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, comments: data.comments } : post
          )
        );
        toast.success('AI Review completed ✨');
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || 'AI Review failed');
        return false;
      }
    },
    []
  );

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
                <div className="w-36 h-3 bg-gray-800 rounded" />
              </div>
            </div>
          </div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (error || !developerData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Developer not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const followersCount = developerData.followers?.length || 0;
  const followingCount = developerData.following?.length || 0;

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
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
          <div className="flex items-start gap-5 flex-wrap">
            <Avatar
              firstName={developerData.firstName}
              lastName={developerData.lastName}
              image={developerData.avatar}
              size="xl"
            />

            {/* Info */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white">{fullName}</h1>
                {isOwnProfile && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
                {developerData.devScore > 0 && (
                  <span className="flex items-center gap-1 bg-orange-600/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                    <Star size={12} />
                    {developerData.devScore}
                  </span>
                )}
              </div>
              <p className="text-blue-400 mt-1 flex items-center gap-1.5">
                <Briefcase size={14} />
                {developerData.role}
              </p>
              {developerData.location && (
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
                  <MapPin size={14} />
                  {developerData.location}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Joined{' '}
                {developerData.createdAt ? new Date(developerData.createdAt).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric'
                }) : 'Unknown'}
              </p>
            </div>

            {/* Follow / Unfollow button */}
            {!isOwnProfile && user && (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  following
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {following ? (
                  <>
                    <UserMinus size={16} />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>

          {/* Bio */}
          {developerData.bio && (
            <p className="text-gray-300 text-sm mt-4 leading-relaxed">{developerData.bio}</p>
          )}

          {/* Skills */}
          {developerData.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {developerData.skills.map((skill, i) => (
                <SkillChip
                  key={i}
                  skill={skill}
                  developerId={developerData._id}
                  isOwnProfile={isOwnProfile}
                />
              ))}
            </div>
          )}

          {/* Social links */}
          {(developerData.github || developerData.portfolio) && (
            <div className="flex flex-wrap gap-4 mt-4">
              {developerData.github && (
                <a
                  href={developerData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <GitBranch size={16} />
                  GitHub
                </a>
              )}
              {developerData.portfolio && (
                <a
                  href={developerData.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <LinkIcon size={16} />
                  Portfolio
                </a>
              )}
            </div>
          )}

          {/* GitHub Activity */}
          {developerData.githubUsername && (
            <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col gap-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                GitHub Activity
              </h3>
              <ContributionGraph data={ghContributions} loading={ghLoading} />
              <GitHubRepos repos={ghRepos} loading={ghLoading} />
            </div>
          )}


          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-white font-bold text-xl">{posts.length}</p>
              <p className="text-gray-400 text-sm">Posts</p>
            </div>
            <button
              onClick={() => setShowFollowersModal(true)}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <p className="text-white font-bold text-xl">{followersCount}</p>
              <p className="text-gray-400 text-sm">Followers</p>
            </button>
            <button
              onClick={() => setShowFollowingModal(true)}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <p className="text-white font-bold text-xl">{followingCount}</p>
              <p className="text-gray-400 text-sm">Following</p>
            </button>
            <div className="text-center">
              <p className="text-white font-bold text-xl flex items-center justify-center gap-1">
                <Star size={18} className="text-orange-400" />
                {developerData.devScore || 0}
              </p>
              <p className="text-gray-400 text-sm">Dev Score</p>
            </div>
          </div>
        </div>

        {/* Developer posts */}
        <h2 className="text-white font-semibold mb-4">
          Posts by {developerData.firstName}
        </h2>

        {posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description={`${developerData.firstName} hasn't posted anything yet`}
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
                onAiReview={aiReview}
              />
            ))}
          </div>
        )}

        {/* Followers Modal */}
        <FollowListModal
          open={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          type="followers"
          userId={id}
        />

        {/* Following Modal */}
        <FollowListModal
          open={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          type="following"
          userId={id}
        />
      </div>
    </div>
  );
};

export default DeveloperProfile;
