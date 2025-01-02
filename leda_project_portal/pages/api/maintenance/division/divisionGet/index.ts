import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Division} from '@/lib/definitions';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await query<Division>('SELECT "divisionName" FROM maint.leda_maint_divisions;');
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}