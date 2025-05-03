// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";



export default async function handler(  
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        if (req.query.ledaId) {
            try {
                // Execute the database query to fetch unique payment dates for a specific ledaId
                const result = await query(
                    'SELECT DISTINCT "date" FROM maint.leda_maint_team_payment_history WHERE "ledaId" = $1 ORDER BY "date";',
                    [req.query.ledaId as string]
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } catch (error) {
                // Handle any errors that occur during the query
                res.status(500).json({ message: "Failed to fetch unique payment dates for ledaId", error });
            }
        } else {
            try {
                // Execute the database query to fetch unique payment dates
                const result = await query(
                    'SELECT DISTINCT "date" FROM maint.leda_maint_team_payment_history ORDER BY "date";'
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } catch (error) {
                // Handle any errors that occur during the query
                res.status(500).json({ message: "Failed to fetch unique payment dates", error });
            }
        }
    } else {
        // Handle unsupported HTTP methods
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 