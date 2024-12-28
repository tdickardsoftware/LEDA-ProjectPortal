import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { PayoutTier } from '@/lib/definitions';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await query<PayoutTier>(`SELECT "place", trunc("amount"::numeric, 2) as "amount"  FROM maint.leda_maint_payout_tiers;`);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payout tiers' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}