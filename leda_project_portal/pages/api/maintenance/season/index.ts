import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Season } from '@/lib/definitions';
import { queryPost } from '@/lib/query';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const result = await query<Season>('SELECT "seasonCode", "desc", "fiscalYear", "dates", "isCurrentSeason" FROM maint.leda_maint_seasons;');
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch season information' });
        }
    } else if (req.method === 'POST') {
        try {
                console.log(req.body);
                const results = req.body as Season;
        
                const query = `INSERT INTO maint.leda_maint_seasons(
                            "seasonCode", "fiscalYear", "dates", "desc", "isCurrentSeason")
                            VALUES ($1, $2, $3, $4, $5);`;
                const values = [
                    results.seasonCode,
                    results.fiscalYear,
                    results.dates,
                    results.desc,
                    results.isCurrentSeason,
                ];
        
                const result = await queryPost(query, values);
        
                res.status(201).json({ insert1: result});
            } catch (error: any) {
                console.error("Error in SeasonHandler:", error);
                res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
            }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}