import { supabase } from '../supabaseClient';

export const ComplaintsRepository = {
  async list() {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        creator:user_profiles!complaints_user_id_fkey (
          user_id,
          username
        ),
        escalator:user_profiles!complaints_escalated_by_fkey (
          user_id,
          username
        ),
        replies (
          id,
          content,
          created_at,
          author:user_profiles!replies_user_id_fkey (
            user_id,
            username
          ),
          compensations (
            id,
            options,
            status,
            selected_option,
            revealed_at,
            creator:user_profiles!compensations_user_id_fkey (
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
          author:user_profiles!pleas_user_id_fkey (
            user_id,
            username
          ),
          resolver:user_profiles!pleas_resolved_by_fkey (
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
        creator:user_profiles!complaints_user_id_fkey (
          user_id,
          username
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }
}; 