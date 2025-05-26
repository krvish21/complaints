import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user } = useAuth();

  const loadComplaints = async () => {
    try {
      // First, get the complaints
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (complaintsError) throw complaintsError;

      // For each complaint, get the user info
      const complaintsWithUsers = await Promise.all(
        complaintsData.map(async (complaint) => {
          // Get user info
          const { data: userData } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', complaint.user_id)
            .single();

          // Get replies
          const { data: repliesData } = await supabase
            .from('replies')
            .select('id, content, created_at, user_id')
            .eq('complaint_id', complaint.id);

          // Get reactions
          const { data: reactionsData } = await supabase
            .from('reactions')
            .select('reaction, user_id')
            .eq('complaint_id', complaint.id);

          return {
            ...complaint,
            user: userData || { id: complaint.user_id, email: 'Unknown' },
            replies: repliesData || [],
            reactions: reactionsData || []
          };
        })
      );

      setComplaints(complaintsWithUsers || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  useEffect(() => {
    loadComplaints();

    // Subscribe to realtime changes
    const complaintsSubscription = supabase
      .channel('complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, loadComplaints)
      .subscribe();

    return () => {
      complaintsSubscription.unsubscribe();
    };
  }, []);

  const addComplaint = async (newComplaint) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert([{
          ...newComplaint,
          user_id: user.id
        }])
        .select('*')
        .single();

      if (error) throw error;
      await loadComplaints();
      return data;
    } catch (error) {
      console.error('Error adding complaint:', error);
      throw error;
    }
  };

  const updateComplaint = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      throw error;
    }
  };

  const deleteComplaint = async (id) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      throw error;
    }
  };

  const addReply = async (complaintId, content) => {
    try {
      const { error } = await supabase
        .from('replies')
        .insert([{
          complaint_id: complaintId,
          user_id: user.id,
          content
        }]);

      if (error) throw error;
      await loadComplaints();
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  };

  const updateReaction = async (complaintId, reaction) => {
    try {
      if (!reaction) {
        // Remove reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('complaint_id', complaintId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Upsert reaction
        const { error } = await supabase
          .from('reactions')
          .upsert({
            complaint_id: complaintId,
            user_id: user.id,
            reaction
          }, {
            onConflict: 'complaint_id,user_id'
          });

        if (error) throw error;
      }
      await loadComplaints();
    } catch (error) {
      console.error('Error updating reaction:', error);
      throw error;
    }
  };

  return {
    complaints,
    addComplaint,
    updateComplaint,
    deleteComplaint,
    addReply,
    updateReaction,
  };
}; 