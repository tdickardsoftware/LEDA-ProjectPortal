// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet';
import { Team } from '@/lib/definitions';
import { queryPost } from '@/lib/query';
import getNextLedaId from '@/lib/getNextLedaId';

// Define the API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle GET requests
    if (req.method === 'GET') {
        try {
            // Execute the database query to fetch team information
            const result = await query<Team>(`SELECT "ledaId", "teamName", TO_CHAR("establishedDate", 'mm/dd/yyyy') as "establishedDate", "memo", "lastTeamFeePayment" FROM public.leda_team_info;`);
            // Respond with the query result
            res.status(200).json(result.rows);
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({ error: 'Failed to fetch genders' });
        }
    } 
    // Handle POST requests
    else if (req.method === 'POST') {
        try {
            const results = req.body as Team;

            // Generate a new ledaId if it is not provided
            if (results.ledaId === 0) {
                results.ledaId = await getNextLedaId('leda_team_info');
            }

            // Define the query to insert a new team
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
            // Execute the insert query
            const result = await queryPost(query, values);
            // Respond with the result of the insert operation
            res.status(201).json({ insert1: result });
        } catch (error: any) {
            // Handle any errors that occur during the insert operation
            console.error("Error in PlayerHandler:", error);
            res.status(500).json({ message: error.message || "Server error" }); // Send error info in JSON
        }
    } 
    // Respond with a 405 status code for unsupported methods
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}