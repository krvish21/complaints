import { supabase } from '../src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const complaint = req.body;
    
    // Ensure created_at is set
    complaint.created_at = new Date().toISOString();

    // Insert the complaint into Supabase with explicit columns
    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        title: complaint.title,
        description: complaint.description,
        mood: complaint.mood,
        category: complaint.category,
        severity: complaint.severity,
        created_at: complaint.created_at,
        reply: complaint.reply || null,
        reaction: complaint.reaction || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        message: 'Failed to save complaint', 
        error: error.message,
        details: error.details
      });
    }

    console.log('Saved complaint:', data);
    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}