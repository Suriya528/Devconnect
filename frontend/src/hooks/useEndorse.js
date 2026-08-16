import { useState, useCallback } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const useEndorse = (userId, skillName, initialEndorsed = false, initialCount = 0) => {
  const [endorsed, setEndorsed] = useState(initialEndorsed);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleEndorse = useCallback(async () => {
    if (!userId || !skillName) return;

    const previousEndorsed = endorsed;
    const previousCount = count;

    setEndorsed((prev) => !prev);
    setCount((prev) => (previousEndorsed ? prev - 1 : prev + 1));
    setLoading(true);

    try {
      const { data } = await axios.post(`/api/user/${userId}/skills/${skillName}/endorse`);
      setEndorsed(data.endorsed);
      setCount(data.endorsementCount);
      toast.success(data.endorsed ? 'Skill endorsed!' : 'Endorsement removed');
    } catch (err) {
      setEndorsed(previousEndorsed);
      setCount(previousCount);
      toast.error(err.response?.data?.message || 'Failed to endorse skill');
    } finally {
      setLoading(false);
    }
  }, [userId, skillName, endorsed, count]);

  return { endorsed, count, loading, toggleEndorse };
};

export default useEndorse;
