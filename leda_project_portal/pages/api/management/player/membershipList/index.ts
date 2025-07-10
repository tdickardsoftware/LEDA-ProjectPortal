// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {   ListsMembership } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle GET requests
    if (req.method === "GET") {
        try {
            if (req.query.seasonCode && req.query.divisions) {
                // Execute the database query to fetch season code information
                const divisions = Array.isArray(req.query.divisions)
                    ? req.query.divisions
                    : [req.query.divisions as string];

                const placeholders = divisions.map((_, i) => `$${i + 2}`).join(", ");

                const result = await query<ListsMembership>(
                    `SELECT "playerId", "fullName", "phoneNumber", email, "addressOne", "addressTwo", city, state, zip, "divisionInfo" FROM public.leda_reports_lists_member_list WHERE "seasonCode" = $1 AND "division" IN (${placeholders})`,
                    [req.query.seasonCode as string, ...divisions]
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } else if (req.query.establishedDate && req.query.divisions) {
                // If establishDate is provided, fetch membership list based on it
                // Execute the database query to fetch season code information
                const divisions = Array.isArray(req.query.divisions)
                    ? req.query.divisions
                    : [req.query.divisions as string];

                const placeholders = divisions.map((_, i) => `$${i + 2}`).join(", ");
                
                const result = await query<ListsMembership>(
                    `SELECT "playerId", "fullName", "phoneNumber", email, "addressOne", "addressTwo", city, state, zip, "divisionInfo" FROM public.leda_reports_lists_member_list WHERE "establishedDate" >= $1 AND "division" IN (${placeholders})`,
                    [req.query.establishDate as string, ...divisions]
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } else {
                // If no season code is provided, return an error
                res.status(400).json({ error: "Season code or established date is required" });
            }
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({
                message: "Failed to fetch membership list",
                error,
            });
        }
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}