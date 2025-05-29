import { supabase } from '../supabaseClient';

export const CompensationsRepository = {
  async create(compensationData) {
    const { data, error } = await supabase
      .from('compensations')
      .insert([{
        ...compensationData,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async reveal(compensationId, selectedOption) {
    const { data, error } = await supabase
      .from('compensations')
      .update({
        status: 'revealed',
        selected_option: selectedOption,
        revealed_at: new Date().toISOString()
      })
      .eq('id', compensationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 