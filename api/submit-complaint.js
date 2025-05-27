import { supabase } from '../src/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const complaint = req.body;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Ensure created_at is set and add user_id
    complaint.created_at = new Date().toISOString();
    complaint.user_id = user.id;

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
        user_id: complaint.user_id
      }])
      .select(`
        *,
        profiles:user_id(id, username),
        replies(
          id,
          content,
          created_at,
          profiles:user_id(id, username)
        ),
        reactions(
          id,
          reaction,
          profiles:user_id(id, username)
        )
      `)
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