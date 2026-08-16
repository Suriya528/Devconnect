import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const usePosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const fetchPosts = useCallback(async (cursor = null, append = false) => {
    try {
      setError(null);
      const params = { limit: 10 };
      if (cursor) {
        params.cursor = cursor;
      }

      const { data } = await axios.get('/api/posts', { params });

      const newPosts = data.posts || [];
      const { hasMore: more, nextCursor: next } = data.pagination || { hasMore: false, nextCursor: null };

      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
      setHasMore(more);
      setNextCursor(next);
    } catch (err) {
      setError('Failed to fetch posts');
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (!loadingMore && hasMore && nextCursor) {
      setLoadingMore(true);
      try {
        const { data } = await axios.get('/api/posts', {
          params: { cursor: nextCursor, limit: 10 }
        });

        const newPosts = data.posts || [];
        const { hasMore: more, nextCursor: next } = data.pagination || { hasMore: false, nextCursor: null };

        setPosts((prev) => [...prev, ...newPosts]);
        setHasMore(more);
        setNextCursor(next);
      } catch (err) {
        toast.error('Failed to load more posts');
      } finally {
        setLoadingMore(false);
      }
    }
  }, [loadingMore, hasMore, nextCursor]);

  const toggleLike = useCallback(
    async (postId) => {
      if (!user) return;
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: (post.likes || []).some(
                  (id) => id.toString() === user._id.toString()
                )
                  ? (post.likes || []).filter(
                      (id) => id.toString() !== user._id.toString()
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
        fetchPosts(nextCursor, true);
      }
    },
    [user, nextCursor, fetchPosts]
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
                  comments: (post.comments || []).filter(
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

  return {
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
  };
};

export default usePosts;
