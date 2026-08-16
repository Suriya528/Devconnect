import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const useProfile = () => {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile first - this is the critical request
        const profileRes = await axios.get('/api/user/profile');
        const userData = profileRes.data;

        // Flatten the nested name object for easier frontend access
        setProfile({
          ...userData,
          firstName: userData.name?.firstName,
          middleName: userData.name?.middleName,
          lastName: userData.name?.lastName,
          avatar: userData.avatar,
          portfolio: userData.portfolio
        });

        // Try to fetch posts, but don't fail the whole profile if this fails
        try {
          const postsRes = await axios.get(`/api/posts/user/${user?._id}`);
          setPosts(postsRes.data);
        } catch (postsErr) {
          // Posts endpoint may not exist on older backends - don't block profile
          setPosts([]);
        }
      } catch (err) {
        setError('Failed to load profile');
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchProfile();
  }, [user?._id]);

  const updateProfile = async (formData) => {
    try {
      setUpdating(true);
      const { data } = await axios.put('/api/user/profile', formData);

      // Sync updated data back to AuthContext
      login(
        {
          _id: data._id,
          firstName: data.name?.firstName,
          middleName: data.name?.middleName,
          lastName: data.name?.lastName,
          email: data.email,
          role: data.role,
          bio: data.bio,
          skills: data.skills,
          location: data.location,
          github: data.github,
          portfolio: data.portfolio,
          linkedin: data.linkedin,
          availability: data.availability,
          avatar: data.avatar
        },
        token
      );

      // Flatten the response for the profile state
      setProfile({
        ...data,
        firstName: data.name?.firstName,
        middleName: data.name?.middleName,
        lastName: data.name?.lastName,
        avatar: data.avatar,
        portfolio: data.portfolio
      });
      toast.success('Profile updated successfully! ✅');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { profile, posts, loading, updating, error, updateProfile };
};

export default useProfile;