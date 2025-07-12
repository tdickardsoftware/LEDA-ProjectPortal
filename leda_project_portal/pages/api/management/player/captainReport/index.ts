// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { ListsCaptains } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle GET requests
    if (req.method === "GET") {
        try {
            if (req.query.seasonCode && req.query.divisions) {
                // Format the divisions string for SQL IN clause
                const divisionsString = req.query.divisions as string;
                // Split by comma, trim whitespace, and wrap each value in single quotes
                const formattedDivisions = divisionsString
                    .split(",")
                    .map((division) => `'${division.trim()}'`)
                    .join(",");

                // Execute the database query with the properly formatted divisions
                const queryText = `SELECT "ledaId", "fullName", "seasonCode", "teamName", "placeName", "division", "divisionInfo", "phoneNumber" FROM public.leda_reports_lists_captains_report WHERE "seasonCode" = $1 AND "division" IN (${formattedDivisions})`;

                const result = await query<ListsCaptains>(
                    queryText,
                    [req.query.seasonCode as string]
                );

                // Respond with the query result
                res.status(200).json(result.rows);
            } else {
                // If no season code is provided, return an error
                res
                    .status(400)
                    .json({ error: "Season code and divisions are required" });
            }
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({
                message: "Failed to fetch captain report data",
                error,
            });
        }
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}