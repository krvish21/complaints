import { supabase } from '../supabaseClient';

export const ComplaintsRepository = {
  async list() {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        user_profiles!user_id (
          user_id,
          username
        ),
        user_profiles!escalated_by (
          user_id,
          username
        ),
        replies (
          id,
          content,
          created_at,
          user_profiles!user_id (
            user_id,
            username
          ),
          compensations (
            id,
            options,
            status,
            selected_option,
            revealed_at,
            user_profiles!user_id (
              user_id,
              username
            )
          )
        ),
        pleas (
          id,
          content,
          status,
          created_at,
          resolved_at,
          user_profiles!user_id (
            user_id,
            username
          ),
          user_profiles!resolved_by (
            user_id,
            username
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(complaintData) {
    const complaintWithDefaults = {
      ...complaintData,
      status: 'pending' // Can be: pending, upheld, resolved, ok
    };

    const { data, error } = await supabase
      .from('complaints')
      .insert([complaintWithDefaults])
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