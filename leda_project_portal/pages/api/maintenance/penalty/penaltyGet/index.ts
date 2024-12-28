import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Penalty} from '@/lib/definitions';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await query<Penalty>('SELECT "penaltyCode", "desc" FROM maint.leda_maint_penalties;');
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch penalties' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}