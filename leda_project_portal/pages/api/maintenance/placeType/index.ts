import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { PlaceType } from '@/lib/definitions';
import { queryPost } from '@/lib/query';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const result = await query<PlaceType>('SELECT "placeTypeCode", "desc" FROM maint.leda_maint_place_types;');
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch place type' });
        }
    } else if (req.method === 'POST') {
        try {
                console.log(req.body);
                const results = req.body as PlaceType;
        
                const query = `INSERT INTO maint.leda_maint_place_types(
                            "placeTypeCode", "desc")
                            VALUES ($1, $2);`;
                const values = [
                    results.placeTypeCode,
                    results.desc
                ];
        
                const result = await queryPost(query, values);
        
                res.status(201).json({ insert1: result});
            } catch (error: any) {
                console.error("Error in PlaceTypeHandler:", error);
                res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
            }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}