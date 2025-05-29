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
    // First, let's get the basic structure to debug
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        profiles:user_id(id, username),
        reactions(
          id,
          reaction,
          user_id,
          profiles:user_id(id, username)
        ),
        replies(
          id,
          content,
          created_at,
          user_id,
          profiles:user_id(id, username),
          compensations(
            id,
            status,
            options,
            selected_option
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      return;
    }

    // Debug log to see the actual data structure
    console.log('Fetched complaints data:', data);

    // Transform the data to handle potential null values
    const transformedData = (data || []).map(complaint => ({
      ...complaint,
      user: complaint.profiles || { id: null, username: 'Unknown' },
      reactions: (complaint.reactions || []).map(reaction => ({
        ...reaction,
        user: reaction.profiles || { id: null, username: 'Unknown' }
      })),
      replies: (complaint.replies || []).map(reply => ({
        ...reply,
        user: reply.profiles || { id: null, username: 'Unknown' },
        compensations: reply.compensations || []
      }))
    }));

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