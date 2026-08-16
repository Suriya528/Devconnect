import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/user?limit=6');
      // Handle both paginated and non-paginated responses
      const users = Array.isArray(data) ? data : (data.users || []);
      // Filter out the current user
      const others = users.filter((u) => u._id !== user?._id);
      // Flatten nested name objects
      const flattened = others.map((u) => ({
        ...u,
        firstName: u.name?.firstName || u.firstName,
        middleName: u.name?.middleName || u.middleName,
        lastName: u.name?.lastName || u.lastName
      }));
      setRecommendations(flattened.slice(0, 3));
    } catch (err) {
      setError('Failed to load recommendations');
      // Don't toast here - this is a non-critical feature
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, loading, error, fetchRecommendations };
};

export default useRecommendations;