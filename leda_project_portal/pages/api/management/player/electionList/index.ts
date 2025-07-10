// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {  ListsCaptains } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle GET requests
    if (req.method === "GET") {
        try {
            if (req.query.fiscalYear) {
            // Execute the database query to fetch season code information
            const result = await query<ListsCaptains>(
                'SELECT "fullName" FROM public.leda_reports_lists_election_list WHERE "fiscalYear" = $1',
                [req.query.fiscalYear as string]
            );
            // Respond with the query result
            res.status(200).json(result.rows);
        } else {
            // If no fiscal year is provided, return an error
            res.status(400).json({ error: "fiscal year is required" });
        }
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({
                message: "Failed to fetch election list ",
                error,
            });
        }
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}