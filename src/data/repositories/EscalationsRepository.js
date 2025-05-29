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
        user_profiles!escalated_by (
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
        user_profiles!user_id (
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
        user_profiles!user_id (
          user_id,
          username
        ),
        user_profiles!resolved_by (
          user_id,
          username
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }
}; 