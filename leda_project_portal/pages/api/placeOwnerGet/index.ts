import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Player } from '@/lib/definitions';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await query<Player>(`SELECT p."ledaId", CONCAT(COALESCE(p."firstName", ''), ' ', COALESCE(p."middleInitial", ''), ' ', COALESCE(p."lastName", '')) as "fullName", p."lastName", p."firstName", p."middleInitial", m."memberType" 
      FROM public.leda_player_info p 
      JOIN public.leda_membership_info m ON p."ledaId" = m."ledaId" 
      WHERE m."memberType" = 'BAR'`);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch genders' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}