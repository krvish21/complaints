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
    // First, let's just get the basic complaints data
    const { data: complaintsData, error: complaintsError } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (complaintsError) {
      console.error('Error fetching complaints:', complaintsError);
      return;
    }

    // Log the basic structure to understand what we're working with
    console.log('Basic complaints data:', complaintsData);

    // Now let's try to get the auth.users structure
    const { data: usersData, error: usersError } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      console.log('Users structure:', usersData);
    }

    // Let's also check what tables are available
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
    } else {
      console.log('Available tables:', tablesData);
    }

    // For now, let's just set the basic complaints data
    // Once we understand the structure, we can add the joins back
    setComplaints(complaintsData || []);
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