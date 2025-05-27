import { supabase } from './supabase';

// Complaints
export async function getComplaints() {
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      user:user_id (id, username),
      replies (
        id,
        content,
        created_at,
        user:user_id (id, username)
      ),
      reactions (
        id,
        reaction,
        user:user_id (id, username)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createComplaint(complaintData) {
  const { data, error } = await supabase
    .from('complaints')
    .insert([{
      ...complaintData,
      user_id: (await supabase.auth.getUser()).data.user.id
    }])
    .select();

  if (error) throw error;
  return data[0];
}

// Replies
export async function addReply(complaintId, content) {
  const { data, error } = await supabase
    .from('replies')
    .insert([{
      complaint_id: complaintId,
      content,
      user_id: (await supabase.auth.getUser()).data.user.id
    }])
    .select(`
      id,
      content,
      created_at,
      user:user_id (id, username)
    `);

  if (error) throw error;
  return data[0];
}

// Reactions
export async function addReaction(complaintId, reaction) {
  const userId = (await supabase.auth.getUser()).data.user.id;

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
      .select(`
        id,
        reaction,
        user:user_id (id, username)
      `);

    if (error) throw error;
    return data[0];
  } else {
    // Create new reaction
    const { data, error } = await supabase
      .from('reactions')
      .insert([{
        complaint_id: complaintId,
        reaction,
        user_id: userId
      }])
      .select(`
        id,
        reaction,
        user:user_id (id, username)
      `);

    if (error) throw error;
    return data[0];
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