import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../contexts/UserContext';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const { user: currentUser, users, isVishu, isSabaa } = useUser();

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
        user_profiles!user_id (
          user_id,
          username
        ),
        reactions (
          id,
          reaction,
          user_id,
          user_profiles!user_id (
            user_id,
            username
          )
        ),
        replies (
          id,
          content,
          created_at,
          user_id,
          user_profiles!user_id (
            user_id,
            username
          ),
          compensations (
            id,
            status,
            options,
            selected_option,
            user_id,
            user_profiles!user_id (
              user_id,
              username
            )
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

    // Transform the data to include user information
    const transformedData = complaintsData.map(complaint => {
      const transformedComplaint = {
        ...complaint,
        // Add user info for the complaint
        user: complaint.user_profiles || { 
          user_id: complaint.user_id,
          username: complaint.user_id === '2' ? 'Vishu' : 'Sabaa'
        },
        // Transform reactions
        reactions: (complaint.reactions || []).map(reaction => ({
          ...reaction,
          // Add user info for each reaction
          user: reaction.user_profiles || {
            user_id: reaction.user_id,
            username: reaction.user_id === '2' ? 'Vishu' : 'Sabaa'
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
            selected_option: comp.selected_option || null,
            user: comp.user_profiles || {
              user_id: comp.user_id,
              username: comp.user_id === '2' ? 'Vishu' : 'Sabaa'
            }
          }));

          // Transform reply with proper user info
          const transformedReply = {
            ...reply,
            user: reply.user_profiles || {
              user_id: reply.user_id,
              username: reply.user_id === '2' ? 'Vishu' : 'Sabaa'
            },
            compensations: transformedCompensations,
            hasCompensation: transformedCompensations.length > 0
          };

          console.log('Transformed reply:', transformedReply);
          return transformedReply;
        })
      };

      return transformedComplaint;
    });

    console.log('Setting complaints state with:', transformedData);
    setComplaints(transformedData);
  };

  const addComplaint = async (complaintData) => {
    console.log('Adding complaint with data:', complaintData);
    console.log('Current user:', currentUser);

    // Add user_id based on current user
    const complaintWithUser = {
      ...complaintData,
      user_id: currentUser.user_id,
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
    console.log('Current user for reply:', currentUser);

    const replyData = {
      complaint_id: complaintId,
      content,
      user_id: currentUser.user_id,
      created_at: new Date().toISOString()
    };

    console.log('Submitting reply to Supabase:', replyData);

    const { data, error } = await supabase
      .from('replies')
      .insert([replyData])
      .select(`
        *,
        user_profiles!user_id (
          user_id,
          username
        )
      `);

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
    console.log('Updating reaction:', { complaintId, reaction, currentUser });
    
    if (!reaction) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .match({ complaint_id: complaintId, user_id: currentUser.user_id });

      if (error) {
        console.error('Error removing reaction:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('reactions')
        .upsert(
          { 
            complaint_id: complaintId, 
            reaction,
            user_id: currentUser.user_id
          },
          { 
            onConflict: 'complaint_id,user_id'
          }
        );

      if (error) {
        console.error('Error updating reaction:', error);
        return false;
      }
    }

    // Fetch updated complaints immediately
    await fetchComplaints();
    return true;
  };

  const addCompensation = async (replyId, options) => {
    console.log('Adding compensation for reply:', replyId, 'with options:', options);
    
    try {
      // First verify the current user is Vishu
      if (!isVishu) {
        console.error('Only Vishu can add compensations');
        return false;
      }

      // Then verify the reply is from Sabaa
      const { data: replyData, error: replyError } = await supabase
        .from('replies')
        .select('user_id, user_profiles!user_id(username)')
        .eq('id', replyId)
        .single();

      if (replyError) {
        console.error('Error fetching reply:', replyError);
        return false;
      }

      if (replyData.user_profiles?.username !== 'Sabaa') {
        console.error('Can only add compensations to Sabaa\'s replies');
        return false;
      }

      // Check if a compensation already exists
      const { data: existingCompensations, error: checkError } = await supabase
        .from('compensations')
        .select('id')
        .eq('reply_id', replyId);

      if (checkError) {
        console.error('Error checking existing compensations:', checkError);
        return false;
      }

      if (existingCompensations?.length > 0) {
        console.error('Compensation already exists for this reply');
        return false;
      }

      // Add the new compensation
      const { data: newCompensation, error: insertError } = await supabase
        .from('compensations')
        .insert([{
          reply_id: replyId,
          options: options,
          status: 'pending',
          user_id: currentUser.user_id
        }])
        .select();

      if (insertError) {
        console.error('Error adding compensation:', insertError);
        return false;
      }

      console.log('Successfully added compensation:', newCompensation);
      await fetchComplaints();
      return true;

    } catch (error) {
      console.error('Unexpected error in addCompensation:', error);
      return false;
    }
  };

  const revealCompensation = async (compensationId, selectedOption) => {
    console.log('Revealing compensation:', compensationId, 'with option:', selectedOption);
    
    // First verify the current user is Sabaa
    if (!isSabaa) {
      console.error('Only Sabaa can reveal compensations');
      return false;
    }

    // Get the current compensation state
    const { data: compensation, error: fetchError } = await supabase
      .from('compensations')
      .select('*')
      .eq('id', compensationId)
      .single();

    if (fetchError) {
      console.error('Error fetching compensation:', fetchError);
      return false;
    }

    if (compensation.status === 'revealed') {
      console.error('Compensation already revealed');
      return false;
    }

    // Update the compensation with all required fields
    const { error: updateError } = await supabase
      .from('compensations')
      .update({ 
        status: 'revealed',
        selected_option: selectedOption,
        updated_at: new Date().toISOString()
      })
      .eq('id', compensationId);

    if (updateError) {
      console.error('Error revealing compensation:', updateError);
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