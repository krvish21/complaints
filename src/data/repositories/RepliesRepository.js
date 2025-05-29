import { supabase } from '../supabaseClient';

export const RepliesRepository = {
  async create(replyData) {
    const { data, error } = await supabase
      .from('replies')
      .insert([replyData])
      .select(`
        *,
        author:user_profiles!replies_user_id_fkey (
          user_id,
          username
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }
}; 