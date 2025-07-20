// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { ListsTeams } from "@/lib/definitions";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle GET requests
    if (req.method === "GET") {
        try {
            if (req.query.seasonCode && req.query.divisions && req.query.minSubdivision && req.query.maxSubdivision) {
                // Format the divisions string for SQL IN clause
                const divisionsString = req.query.divisions as string;
                // Split by comma, trim whitespace, and wrap each value in single quotes
                const formattedDivisions = divisionsString
                    .split(",")
                    .map((division) => `'${division.trim()}'`)
                    .join(",");
                
                const result = await query<ListsTeams>(
                    `SELECT "teamId", "teamName", "placeName", "addressFirstLine", "addressSecondLine", "placePhoneNumber", "captainFullName", "captainPhoneNumber", "divisionInfo" FROM public.leda_reports_lists_team_list WHERE "seasonCode" = $1 AND "division" IN (${formattedDivisions}) AND "subdivision" BETWEEN $2 AND $3`,
                    [req.query.seasonCode as string, req.query.minSubdivision as string, req.query.maxSubdivision as string]
                );
                if (result.rows.length === 0) {
                    res.status(404).json({ error: "No teams found for the given criteria."});
                }
                // Respond with the query result
                res.status(200).json(result.rows);
                
            } else if (req.query.establishedDate) {
                // Parse date string to a format Postgres can compare (YYYY-MM-DD)
                let establishedDate = req.query.establishedDate as string;
                if (establishedDate.includes("T")) {
                    establishedDate = establishedDate.split("T")[0];
                }
                if (!establishedDate) {
                    res.status(400).json({ error: "establishedDate is required" });
                    return;
                }
                const result = await query<ListsTeams>(`SELECT DISTINCT "teamId", "teamName", "placeName", "addressFirstLine", "addressSecondLine", "placePhoneNumber", "captainFullName", "captainPhoneNumber", "divisionInfo" FROM public.leda_reports_lists_team_list WHERE "establishedDate" >= $1`, [establishedDate]);

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