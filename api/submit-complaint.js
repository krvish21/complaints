import { supabase } from '../src/lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const complaint = req.body;
    
    // Add timestamp for created_at
    complaint.created_at = new Date().toISOString();

    // Insert the complaint into Supabase
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaint])
      .select()
      .single();

    if (error) throw error;

    console.log('Saved complaint:', data);
    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      message: 'Failed to save complaint', 
      error: error.message 
    });
  }
}