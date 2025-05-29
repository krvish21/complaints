import { supabase } from '../supabaseClient';

export const ReactionsRepository = {
  async upsert(reactionData) {
    const { data, error } = await supabase
      .from('reactions')
      .upsert(reactionData, {
        onConflict: 'complaint_id,user_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(complaintId, userId) {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .match({ complaint_id: complaintId, user_id: userId });

    if (error) throw error;
    return true;
  }
}; 