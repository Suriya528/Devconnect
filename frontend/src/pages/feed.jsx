

import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import CreatePost from '../components/CreatePost';
import usePosts from '../hooks/usePosts';

const Feed = () => {
  const { posts, loading, fetchPosts, toggleLike, deletePost } = usePosts();

  const handlePostCreated = (newPost) => {
    fetchPosts(); // Refresh feed after new post
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-white mb-6">
          Developer Feed 🚀
        </h1>

        {/* Create post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Posts list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg">No posts yet</p>
            <p className="text-sm mt-1">Be the first to post something! 👆</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={toggleLike}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Feed;