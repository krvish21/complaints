import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    // Fetch initial data
    fetchComplaints();

    // Set up real-time subscriptions
    const complaintsSubscription = supabase
      .channel('complaints-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints'
        },
        () => fetchComplaints()
      )
      .subscribe();

    const repliesSubscription = supabase
      .channel('replies-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'replies'
        },
        () => fetchComplaints()
      )
      .subscribe();

    const reactionsSubscription = supabase
      .channel('reactions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions'
        },
        () => fetchComplaints()
      )
      .subscribe();

    const compensationsSubscription = supabase
      .channel('compensations-channel')
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
      complaintsSubscription.unsubscribe();
      repliesSubscription.unsubscribe();
      reactionsSubscription.unsubscribe();
      compensationsSubscription.unsubscribe();
    };
  }, []);

  const fetchComplaints = async () => {
    // Get complaints with their related data
    const { data: complaintsData, error: complaintsError } = await supabase
      .from('complaints')
      .select(`
        *,
        reactions (
          id,
          reaction
        ),
        replies (
          id,
          content,
          created_at,
          compensations (
            id,
            status,
            options,
            selected_option
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (complaintsError) {
      console.error('Error fetching complaints:', complaintsError);
      return;
    }

    // Transform the data to include default user information
    const transformedData = (complaintsData || []).map(complaint => ({
      ...complaint,
      // Add default user info for the complaint
      user: { 
        id: complaint.user_id || 'unknown',
        username: complaint.user_id === 'sabaa' ? 'Sabaa' : 'Vishu'
      },
      // Transform reactions
      reactions: (complaint.reactions || []).map(reaction => ({
        ...reaction,
        // Add default user info for each reaction
        user: {
          id: reaction.user_id || 'unknown',
          username: reaction.user_id === 'sabaa' ? 'Sabaa' : 'Vishu'
        }
      })),
      // Transform replies
      replies: (complaint.replies || []).map(reply => ({
        ...reply,
        // Add default user info for each reply
        user: {
          id: reply.user_id || 'unknown',
          username: reply.user_id === 'sabaa' ? 'Sabaa' : 'Vishu'
        },
        // Ensure compensations array exists
        compensations: reply.compensations || []
      }))
    }));

    console.log('Transformed complaints data:', transformedData);
    setComplaints(transformedData);
  };

  const addComplaint = async (complaintData) => {
    const { error } = await supabase
      .from('complaints')
      .insert([complaintData]);

    if (error) {
      console.error('Error adding complaint:', error);
      return false;
    }
    return true;
  };

  const addReply = async (complaintId, content) => {
    const { error } = await supabase
      .from('replies')
      .insert([{ complaint_id: complaintId, content }]);

    if (error) {
      console.error('Error adding reply:', error);
      return false;
    }
    return true;
  };

  const updateReaction = async (complaintId, reaction) => {
    if (!reaction) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .match({ complaint_id: complaintId });

      if (error) {
        console.error('Error removing reaction:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('reactions')
        .upsert(
          { complaint_id: complaintId, reaction },
          { onConflict: 'complaint_id' }
        );

      if (error) {
        console.error('Error updating reaction:', error);
        return false;
      }
    }
    return true;
  };

  const addCompensation = async (replyId, options) => {
    const { error } = await supabase
      .from('compensations')
      .insert([{ 
        reply_id: replyId, 
        options,
        status: 'pending'
      }]);

    if (error) {
      console.error('Error adding compensation:', error);
      return false;
    }
    return true;
  };

  const revealCompensation = async (compensationId, selectedOption) => {
    const { error } = await supabase
      .from('compensations')
      .update({ 
        status: 'revealed',
        selected_option: selectedOption
      })
      .eq('id', compensationId);

    if (error) {
      console.error('Error revealing compensation:', error);
      return false;
    }
    return true;
  };

  return {
    complaints,
    addComplaint,
    addReply,
    updateReaction,
    addCompensation,
    revealCompensation
  };
}; 