import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Team } from '@/lib/definitions';
import { queryPost } from '@/lib/query';
import getNextLedaId from '@/lib/getNextLedaId';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const result = await query<Team>(`SELECT "ledaId", "teamName", TO_CHAR("establishedDate", 'mm/dd/yyyy') as "establishedDate", "memo", "lastTeamFeePayment" FROM public.leda_team_info;`);
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch genders' });
        }
    } else if (req.method === 'POST') {
        try {
                console.log(req.body);
                const results = req.body as Team;
        
                if (results.ledaId === 0) {
                    results.ledaId = await getNextLedaId('leda_team_info');
                }
        
                const query = `INSERT INTO public.leda_team_info(
                            "ledaId", "teamName", "establishedDate", memo, "lastTeamFeePayment")
                            VALUES ($1, $2, $3, $4, $5);`;
                const values = [
                    results.ledaId,
                    results.teamName,
                    results.establishedDate,
                    results.memo,
                    results.lastTeamFeePayment
                ];
                const result = await queryPost(query, values);
                res.status(201).json({ insert1: result});
            } catch (error: any) {
                console.error("Error in PlayerHandler:", error);
                res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
            }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}