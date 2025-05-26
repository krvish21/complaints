import { supabase } from './client.js';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }   
        
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        console.log('response:: ', data);
        return res.status(200).json(data);
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}   