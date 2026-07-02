import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const usePosts = () => {
  const {user}=useAuth()
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/posts');
      setPosts(data);
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    // Optimistic update — update UI instantly before API call
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              likes: post.likes.some(
  (id) => id.toString() === user._id.toString()
)
  ? post.likes.filter(
      (id) => id.toString() !== user._id.toString()
    )
  : [...post.likes, user._id]
            }
          : post
      )
    );

    try {
      const { data } = await axios.put(`/api/posts/${postId}/like`);
      // Sync with real server response
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes: data.likes } : post
        )
      );
    } catch (error) {
      toast.error('Failed to like post');
      fetchPosts(); // Revert on error
    }
  };

  const deletePost = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, fetchPosts, toggleLike, deletePost };
};

export default usePosts;