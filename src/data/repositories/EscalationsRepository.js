import { supabase } from '../supabaseClient';

export const EscalationsRepository = {
  async updateStatus(complaintId, status, userId) {
    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        status,
        escalated_at: new Date().toISOString(),
        escalated_by: userId
      })
      .eq('id', complaintId)
      .select(`
        *,
        escalator:user_profiles!complaints_escalated_by_fkey (
          user_id,
          username
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async createPlea(complaintId, content, userId) {
    const { data, error } = await supabase
      .from('pleas')
      .insert([{
        complaint_id: complaintId,
        content,
        user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        author:user_profiles!pleas_user_id_fkey (
          user_id,
          username
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePleaStatus(pleaId, status, userId) {
    const { data, error } = await supabase
      .from('pleas')
      .update({ 
        status,
        resolved_at: new Date().toISOString(),
        resolved_by: userId
      })
      .eq('id', pleaId)
      .select(`
        *,
        author:user_profiles!pleas_user_id_fkey (
          user_id,
          username
        ),
        resolver:user_profiles!pleas_resolved_by_fkey (
          user_id,
          username
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }
}; 