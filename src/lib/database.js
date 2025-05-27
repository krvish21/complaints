import { supabase } from './supabase';

// Complaints
export async function getComplaints() {
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      profiles:user_id(id, username),
      replies(
        id,
        content,
        created_at,
        profiles:user_id(id, username)
      ),
      reactions(
        id,
        reaction,
        profiles:user_id(id, username)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createComplaint(complaintData) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const { data, error } = await supabase
    .from('complaints')
    .insert([{
      ...complaintData,
      user_id: user.id
    }])
    .select(`
      *,
      profiles:user_id(id, username),
      replies(
        id,
        content,
        created_at,
        profiles:user_id(id, username)
      ),
      reactions(
        id,
        reaction,
        profiles:user_id(id, username)
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

// Replies
export async function addReply(complaintId, content) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const { data, error } = await supabase
    .from('replies')
    .insert([{
      complaint_id: complaintId,
      content,
      user_id: user.id
    }])
    .select(`
      id,
      content,
      created_at,
      profiles:user_id(id, username)
    `);

  if (error) throw error;
  return data[0];
}

// Reactions
export async function addReaction(complaintId, reaction) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  // First, try to update existing reaction
  const { data: existingReaction } = await supabase
    .from('reactions')
    .select('id')
    .match({ complaint_id: complaintId, user_id: user.id })
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
        profiles:user_id(id, username)
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
        user_id: user.id
      }])
      .select(`
        id,
        reaction,
        profiles:user_id(id, username)
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