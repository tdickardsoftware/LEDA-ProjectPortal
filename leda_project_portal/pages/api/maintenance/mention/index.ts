import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Mention } from '@/lib/definitions';
import { queryPost } from '@/lib/query';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const result = await query<Mention>('SELECT "mentionCode", "desc", "points", "mentionBasis" FROM maint.leda_maint_mentions;');
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch mentions' });
        }
    } else if (req.method === 'POST') {
        try {
                console.log(req.body);
                const results = req.body as Mention;
        
                let query = `INSERT INTO maint.leda_maint_mentions(
                            "mentionCode", "desc", "points", "mentionBasis")
                            VALUES ($1, $2, $3, $4);`;
                let values = [
                    results.mentionCode,
                    results.desc,
                    results.points,
                    results.mentionBasis
                ];
        
                const result = await queryPost(query, values);
        
                res.status(201).json({ insert1: result});
            } catch (error: any) {
                console.error("Error in Mention Handler:", error);
                res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
            }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}