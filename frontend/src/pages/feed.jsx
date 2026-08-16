import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import EmptyState from '../components/EmptyState';
import CreatePostModal from '../components/CreatePostModal';
import usePosts from '../hooks/usePosts';
import { Rss, Loader2, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const Feed = () => {
  const {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    fetchPosts,
    toggleLike,
    deletePost,
    addComment,
    deleteComment,
    aiReview
  } = usePosts();

  const observerTarget = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  const handlePostCreated = () => {
    fetchPosts(null, false);
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-white mb-6">
          Developer Feed 🚀
        </h1>

        {/* Create post button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-6 flex items-center gap-3 hover:border-blue-600 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
          <span className="text-gray-400 text-sm">Share something with the community...</span>
          <Plus size={20} className="text-gray-400 ml-auto" />
        </button>

        {/* Posts list */}
        {loading && posts.length === 0 ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
          </div>
        ) : error && posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg text-red-400">Failed to load posts</p>
            <button
              onClick={() => fetchPosts(null, false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Rss}
            title="No posts yet"
            description="Be the first to post something! 👆"
          />
        ) : (
          <>
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

            {/* Infinite scroll sentinel */}
            <div ref={observerTarget} className="flex flex-col items-center justify-center py-6 gap-2">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Loading more posts...</span>
                </div>
              )}
              {!hasMore && posts.length > 0 && !loadingMore && (
                <p className="text-gray-500 text-sm">No more posts</p>
              )}
            </div>
          </>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </div>
    </div>
  );
};

export default Feed;
