import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getComplaints, createComplaint, addReply as dbAddReply, addReaction as dbAddReaction, subscribeToComplaints } from '../lib/database';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useAuth();

  const loadComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  useEffect(() => {
    loadComplaints();

    // Subscribe to realtime changes
    const unsubscribe = subscribeToComplaints(loadComplaints);

    return () => {
      unsubscribe();
    };
  }, []);

  const addComplaint = async (newComplaint) => {
    try {
      const data = await createComplaint(newComplaint);
      return data;
    } catch (error) {
      console.error('Error adding complaint:', error);
      throw error;
    }
  };

  const addReply = async (complaintId, content) => {
    try {
      await dbAddReply(complaintId, content);
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  };

  const updateReaction = async (complaintId, reaction) => {
    try {
      if (!reaction) {
        // If no reaction is provided, we could implement a delete function
        // For now, we'll just skip empty reactions
        return;
      }
      await dbAddReaction(complaintId, reaction);
    } catch (error) {
      console.error('Error updating reaction:', error);
      throw error;
    }
  };

  return {
    complaints,
    addComplaint,
    addReply,
    updateReaction,
  };
}; 