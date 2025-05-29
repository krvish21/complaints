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
        (payload) => {
          console.log('Complaints change detected:', payload);
          fetchComplaints();
        }
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
        (payload) => {
          console.log('Replies change detected:', payload);
          fetchComplaints();
        }
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
        (payload) => {
          console.log('Reactions change detected:', payload);
          fetchComplaints();
        }
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
        (payload) => {
          console.log('Compensations change detected:', payload);
          fetchComplaints();
        }
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
    console.log('Fetching complaints...');
    // Get complaints with their related data
    const { data: complaintsData, error: complaintsError } = await supabase
      .from('complaints')
      .select(`
        *,
        reactions (
          id,
          reaction,
          user_id
        ),
        replies (
          id,
          content,
          created_at,
          user_id,
          compensations (
            id,
            status,
            options,
            selected_option,
            reply_id
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (complaintsError) {
      console.error('Error fetching complaints:', complaintsError);
      return;
    }

    console.log('Raw complaints data:', complaintsData);

    if (!complaintsData || complaintsData.length === 0) {
      console.log('No complaints found in database');
      setComplaints([]);
      return;
    }

    // Transform the data to include default user information
    const transformedData = complaintsData.map(complaint => {
      console.log('Processing complaint:', complaint);
      const transformedComplaint = {
        ...complaint,
        // Add default user info for the complaint
        user: { 
          id: complaint.user_id || 'unknown',
          username: complaint.user_id === '2' ? 'Sabaa' : 'Vishu'
        },
        // Transform reactions
        reactions: (complaint.reactions || []).map(reaction => ({
          ...reaction,
          // Add default user info for each reaction
          user: {
            id: reaction.user_id || 'unknown',
            username: reaction.user_id === '2' ? 'Sabaa' : 'Vishu'
          }
        })),
        // Transform replies
        replies: (complaint.replies || []).map(reply => {
          // Ensure compensations is an array and properly transformed
          const compensations = Array.isArray(reply.compensations) ? reply.compensations : 
            (reply.compensations ? [reply.compensations] : []);

          // Transform each compensation
          const transformedCompensations = compensations.map(comp => ({
            ...comp,
            options: Array.isArray(comp.options) ? comp.options : [],
            status: comp.status || 'pending',
            selected_option: comp.selected_option || null
          }));

          return {
            ...reply,
            // Add default user info for each reply
            user: {
              id: reply.user_id || 'unknown',
              username: reply.user_id === '2' ? 'Sabaa' : 'Vishu'
            },
            // Set transformed compensations
            compensations: transformedCompensations,
            hasCompensation: transformedCompensations.length > 0
          };
        })
      };

      console.log('Transformed complaint:', transformedComplaint);
      return transformedComplaint;
    });

    console.log('Setting complaints state with:', transformedData);
    setComplaints(transformedData);
  };

  const addComplaint = async (complaintData) => {
    console.log('Adding complaint with data:', complaintData);
    
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"id": "1"}');
    console.log('Current user:', currentUser);

    // Add user_id based on current user
    const complaintWithUser = {
      ...complaintData,
      user_id: currentUser.id,
      created_at: new Date().toISOString()
    };

    console.log('Submitting to Supabase:', complaintWithUser);

    const { data, error } = await supabase
      .from('complaints')
      .insert([complaintWithUser])
      .select('*');

    if (error) {
      console.error('Error adding complaint:', error);
      return false;
    }

    console.log('Successfully added complaint:', data);
    
    // Fetch updated complaints immediately
    console.log('Fetching updated complaints...');
    await fetchComplaints();
    return true;
  };

  const addReply = async (complaintId, content) => {
    console.log('Adding reply:', { complaintId, content });

    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"id": "1"}');
    console.log('Current user for reply:', currentUser);

    const replyData = {
      complaint_id: complaintId,
      content,
      user_id: currentUser.id,
      created_at: new Date().toISOString()
    };

    console.log('Submitting reply to Supabase:', replyData);

    const { data, error } = await supabase
      .from('replies')
      .insert([replyData])
      .select('*');

    if (error) {
      console.error('Error adding reply:', error);
      return false;
    }

    console.log('Successfully added reply:', data);
    
    // Fetch updated complaints immediately
    console.log('Fetching updated complaints after reply...');
    await fetchComplaints();
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
    console.log('Adding compensation for reply:', replyId, 'with options:', options);
    try {
      // Check if a compensation already exists for this reply
      const { data: existingCompensations, error: checkError } = await supabase
        .from('compensations')
        .select('id, reply_id')
        .eq('reply_id', replyId);

      console.log('Existing compensations check:', existingCompensations);

      if (checkError) {
        console.error('Error checking existing compensations:', checkError);
        return false;
      }

      // If compensations already exist, don't add a new one
      if (existingCompensations && existingCompensations.length > 0) {
        console.error('Compensation already exists for this reply:', existingCompensations);
        return false;
      }

      // Add the new compensation
      const { data: newCompensation, error: insertError } = await supabase
        .from('compensations')
        .insert([{ 
          reply_id: replyId, 
          options,
          status: 'pending'
        }])
        .select();

      if (insertError) {
        console.error('Error adding compensation:', insertError);
        return false;
      }

      console.log('Successfully added compensation:', newCompensation);

      // Trigger a refresh of the complaints data
      await fetchComplaints();
      return true;
    } catch (error) {
      console.error('Unexpected error in addCompensation:', error);
      return false;
    }
  };

  const revealCompensation = async (compensationId, selectedOption) => {
    console.log('Revealing compensation:', compensationId, 'with option:', selectedOption);
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

    // Trigger a refresh of the complaints data
    await fetchComplaints();
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