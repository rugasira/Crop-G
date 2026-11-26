// Vercel serverless function: POST /api/chat
import { chat, toHttpError } from '../server/claude';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    res.status(200).json(await chat(req.body));
  } catch (err) {
    const e = toHttpError(err);
    res.status(e.status).json({ message: e.message });
  }
}
