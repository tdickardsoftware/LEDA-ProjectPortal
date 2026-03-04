// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { ListsPlaces } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";

// Define the API route handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await requireApiSession(req, res);
    // Handle GET requests
    if (req.method === "GET") {
        try {
            if (req.query.seasonCode) {
                const result = await query<ListsPlaces>(
                    `SELECT DISTINCT "ledaId", name, email, "addressOne", "addressTwo", city, state, zip, "phoneNumber", contact FROM public.leda_reports_lists_places_list WHERE "seasonCode" = $1`,
                    [req.query.seasonCode as string]
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } else if (req.query.establishedDate && req.query.goodStanding && req.query.badStanding) {
                // Parse date string to a format Postgres can compare (YYYY-MM-DD)
                let establishedDate = req.query.establishedDate as string;
                if (establishedDate.includes("T")) {
                    establishedDate = establishedDate.split("T")[0];
                }
                if (!establishedDate) {
                    res.status(400).json({ error: "establishedDate is required" });
                    return;
                }

                // Convert query params to boolean
                const goodStanding = req.query.goodStanding === "true";
                const badStanding = req.query.badStanding === "true";

                let result;
                const baseQuery = `
                    SELECT DISTINCT "ledaId", name, email, "addressOne", "addressTwo", city, state, zip, "phoneNumber", contact FROM public.leda_reports_lists_places_list
                    WHERE "establishDate" >= $1
                `;

                if (goodStanding && badStanding) {
                    // No standing filter, include all
                    result = await query<ListsPlaces>(
                        baseQuery,
                        [establishedDate]
                    );
                } else if (goodStanding) {
                    result = await query<ListsPlaces>(
                        baseQuery + ` AND "badStanding" = false`,
                        [establishedDate]
                    );
                } else if (badStanding) {
                    result = await query<ListsPlaces>(
                        baseQuery + ` AND "badStanding" = true`,
                        [establishedDate]
                    );
                } else {
                    // Neither selected, return empty array
                    res.status(200).json([]);
                    return;
                }

                res.status(200).json(result.rows);
            } else {
                // If no season code is provided, return an error
                res.status(400).json({ error: "Season code or established date is required" });
            }
        } catch (error) {
            // Handle any errors that occur during the query
            res.status(500).json({
                message: "Failed to fetch teams list",
                error,
            });
        }
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}