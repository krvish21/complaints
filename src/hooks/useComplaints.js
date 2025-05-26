import { useState, useEffect } from 'react';
import { fetchComplaints, submitComplaint } from '../services/api';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);

  const loadComplaints = async () => {
    try {
      const data = await fetchComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const addComplaint = async (newComplaint) => {
    try {
      setComplaints([newComplaint, ...complaints]);
      const response = await submitComplaint(newComplaint);
      console.log('Server response:', response);
      // Fetch fresh complaints data after successful submission
      await loadComplaints();
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      // Rollback optimistic update
      setComplaints(complaints.filter(c => c.id !== newComplaint.id));
    }
  };

  const updateReply = (id, reply) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reply } : c))
    );
  };

  const updateReaction = (id, reaction) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reaction } : c))
    );
  };

  return {
    complaints,
    addComplaint,
    updateReply,
    updateReaction,
  };
}; 