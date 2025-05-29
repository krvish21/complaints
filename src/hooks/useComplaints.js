import { useState, useEffect } from 'react';
import { supabase } from '../data/supabaseClient';
import { ComplaintService } from '../services/ComplaintService';
import { useUser } from '../contexts/UserContext';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user: currentUser } = useUser();

  useEffect(() => {
    // Fetch initial data
    fetchComplaints();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('grievance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints'
        },
        () => fetchComplaints()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'replies'
        },
        () => fetchComplaints()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pleas'
        },
        () => fetchComplaints()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'compensations'
        },
        () => fetchComplaints()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await ComplaintService.listComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const addComplaint = async (content) => {
    try {
      await ComplaintService.createComplaint(content, currentUser.user_id);
      return true;
    } catch (error) {
      console.error('Error adding complaint:', error);
      return false;
    }
  };

  const addReply = async (complaintId, content) => {
    try {
      await ComplaintService.addReply(complaintId, content, currentUser.user_id);
      return true;
    } catch (error) {
      console.error('Error adding reply:', error);
      return false;
    }
  };

  const escalateComplaint = async (complaintId, status) => {
    try {
      await ComplaintService.escalateComplaint(complaintId, status, currentUser.user_id);
      return true;
    } catch (error) {
      console.error('Error escalating complaint:', error);
      return false;
    }
  };

  const createPlea = async (complaintId, content) => {
    try {
      await ComplaintService.createPlea(complaintId, content, currentUser.user_id);
      return true;
    } catch (error) {
      console.error('Error creating plea:', error);
      return false;
    }
  };

  const resolvePlea = async (pleaId, status) => {
    try {
      await ComplaintService.resolvePlea(pleaId, status, currentUser.user_id);
      return true;
    } catch (error) {
      console.error('Error resolving plea:', error);
      return false;
    }
  };

  const addCompensation = async (replyId, options) => {
    try {
      await ComplaintService.addCompensation(replyId, options, currentUser.user_id);
      return true;
    } catch (error) {
      console.error('Error adding compensation:', error);
      return false;
    }
  };

  const revealCompensation = async (compensationId, selectedOption) => {
    try {
      await ComplaintService.revealCompensation(compensationId, selectedOption);
      return true;
    } catch (error) {
      console.error('Error revealing compensation:', error);
      return false;
    }
  };

  return {
    complaints,
    addComplaint,
    addReply,
    escalateComplaint,
    createPlea,
    resolvePlea,
    addCompensation,
    revealCompensation
  };
}; 