import { supabase } from '../src/lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }   
    
    try {
        // Fetch complaints from Supabase, ordered by creation date
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(400).json({ 
                message: 'Failed to fetch complaints', 
                error: error.message,
                details: error.details
            });
        }
        
        return res.status(200).json(data || []);
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
}   