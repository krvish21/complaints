import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getComplaints, createComplaint, addReply as dbAddReply, addReaction as dbAddReaction, subscribeToComplaints } from '../lib/database';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useUser();

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
      const data = await createComplaint({
        ...newComplaint,
        user_id: user.id
      });
      // Update local state immediately for better UX
      setComplaints(prevComplaints => [data, ...prevComplaints]);
      return data;
    } catch (error) {
      console.error('Error adding complaint:', error);
      throw error;
    }
  };

  const addReply = async (complaintId, content) => {
    try {
      const newReply = await dbAddReply(complaintId, content, user.id);
      
      // Update local state immediately for better UX
      setComplaints(prevComplaints => prevComplaints.map(complaint => {
        if (complaint.id === complaintId) {
          return {
            ...complaint,
            replies: [...(complaint.replies || []), newReply]
          };
        }
        return complaint;
      }));
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  };

  const updateReaction = async (complaintId, reaction) => {
    try {
      if (!reaction) {
        return;
      }
      const newReaction = await dbAddReaction(complaintId, reaction, user.id);
      
      // Update local state immediately for better UX
      setComplaints(prevComplaints => prevComplaints.map(complaint => {
        if (complaint.id === complaintId) {
          // Remove existing reaction from this user if it exists
          const filteredReactions = (complaint.reactions || [])
            .filter(r => r.user_id !== user.id);
          
          return {
            ...complaint,
            reactions: [...filteredReactions, newReaction]
          };
        }
        return complaint;
      }));
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