import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Division} from '@/lib/definitions';
import { queryPost } from '@/lib/query';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const result = await query<Division>('SELECT "divisionName" FROM maint.leda_maint_divisions;');
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    } else if (req.method === 'GET') {
        try {
                console.log(req.body);
                const results = req.body as Division;
        
                const query = `INSERT INTO maint.leda_maint_divisions(
                            "divisionName")
                            VALUES ($1);`;
                const values = [
                    results.divisionName
                ];
        
                const result = await queryPost(query, values);
        
                res.status(201).json({ insert1: result});
            } catch (error) {
                console.error("Error in PlayerHandler:", error as Error);
                res.status(500).json({ message: (error as Error).message || "Server error" }); // Send error info in JSON
            }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}