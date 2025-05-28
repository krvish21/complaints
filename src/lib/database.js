import { supabase } from './supabase';

// Complaints
export async function getComplaints() {
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      user:user_id (
        id,
        username
      ),
      replies (
        id,
        content,
        created_at,
        user:user_id (
          id,
          username
        )
      ),
      reactions (
        id,
        reaction,
        user:user_id (
          id,
          username
        ),
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createComplaint(complaintData) {
  const { data, error } = await supabase
    .from('complaints')
    .insert([complaintData])
    .select(`
      *,
      user:user_id (
        id,
        username
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

// Replies
export async function addReply(complaintId, content, userId) {
  const { data, error } = await supabase
    .from('replies')
    .insert([{
      complaint_id: complaintId,
      content,
      user_id: userId
    }])
    .select(`
      *,
      user:user_id (
        id,
        username
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

// Reactions
export async function addReaction(complaintId, reaction, userId) {
  // First, try to update existing reaction
  const { data: existingReaction } = await supabase
    .from('reactions')
    .select('id')
    .match({ complaint_id: complaintId, user_id: userId })
    .single();

  if (existingReaction) {
    // Update existing reaction
    const { data, error } = await supabase
      .from('reactions')
      .update({ reaction })
      .match({ id: existingReaction.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new reaction
    const { data, error } = await supabase
      .from('reactions')
      .insert([{
        complaint_id: complaintId,
        reaction,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Real-time subscriptions
export function subscribeToComplaints(callback) {
  const complaintSubscription = supabase
    .channel('complaints')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'complaints'
    }, () => {
      getComplaints().then(callback);
    })
    .subscribe();

  const replySubscription = supabase
    .channel('replies')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'replies'
    }, () => {
      getComplaints().then(callback);
    })
    .subscribe();

  const reactionSubscription = supabase
    .channel('reactions')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'reactions'
    }, () => {
      getComplaints().then(callback);
    })
    .subscribe();

  // Return cleanup function
  return () => {
    complaintSubscription.unsubscribe();
    replySubscription.unsubscribe();
    reactionSubscription.unsubscribe();
  };
} 