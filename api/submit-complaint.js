export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = req.body;

    console.log('Received complaint:', body); // this will show in Vercel logs

    return res.status(200).json({ message: 'Yooo', data: body });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}