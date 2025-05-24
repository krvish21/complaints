import { supabase } from './client';

export function insertComplaint(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log(req, JSON.stringify(req));
    res.status(200).json({ message: 'Yooo' });
}