// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { ListsPlaces } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle GET requests
    if (req.method === "GET") {
        try {
            if (req.query.seasonCode){
                

                const result = await query<ListsPlaces>(
                    `SELECT "ledaId", name, email, "addressOne", "addressTwo", city, state, zip, "phoneNumber", contact FROM public.leda_reports_lists_places_list WHERE "seasonCode" = $1`,
                    [req.query.seasonCode as string]
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } else if (req.query.establishedDate) {
                const result = await query<ListsPlaces>(
                    `SELECT "ledaId", name, email, "addressOne", "addressTwo", city, state, zip, "phoneNumber", contact FROM public.leda_reports_lists_places_list WHERE "establishedDate" >= $1`,
                    [req.query.establishedDate as string]
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
                message: "Failed to fetch places list",
                error,
            });
        }
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}