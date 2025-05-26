import { supabase } from '../api/client';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
        }   
        
        const response = supabase.from('complaints').select("*");
        console.log('response:: ', response);
        return res.status(200).json(response);
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}