import { supabase } from '../supabaseClient';

export const RepliesRepository = {
  async create(replyData) {
    const { data, error } = await supabase
      .from('replies')
      .insert([replyData])
      .select(`
        *,
        user_profiles!user_id (
          user_id,
          username
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }
}; 