import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { PayoutTier } from '@/lib/definitions';
import { queryPost } from '@/lib/query';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const result = await query<PayoutTier>(`SELECT "place", trunc("amount"::numeric, 2) as "amount"  FROM maint.leda_maint_payout_tiers;`);
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch payout tiers' });
        }
    } else if (req.method === 'PUT') {
        try {
                console.log(req.body);
                const results = req.body as PayoutTier;
        
                const query = `INSERT INTO maint.leda_maint_payout_tiers(
                            "place", "amount")
                            VALUES ($1, $2);`;
                const values = [
                    results.place,
                    results.amount.toPrecision(2)
                ];
        
                const result = await queryPost(query, values);
        
                res.status(201).json({ insert1: result});
            } catch (error: any) {
                console.error("Error in PayoutTierHandler:", error);
                res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
            }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}