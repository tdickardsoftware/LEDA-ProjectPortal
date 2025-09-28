// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {   ListsMembership } from "@/lib/definitions";
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
            if (req.query.seasonCode && req.query.divisions && req.query.minSubdivision && req.query.maxSubdivision) {
                // Format the divisions string for SQL IN clause
                const divisionsString = req.query.divisions as string;
                // Split by comma, trim whitespace, and wrap each value in single quotes
                const formattedDivisions = divisionsString
                    .split(",")
                    .map((division) => `'${division.trim()}'`)
                    .join(",");

                // Add query timeout to prevent hanging
                const result = await Promise.race([
                    query<ListsMembership>(
                        `SELECT "playerId", "fullName", "phoneNumber", email, "addressOne", "addressTwo", city, state, zip, "divisionInfo" FROM public.leda_reports_lists_member_list WHERE "seasonCode" = $1 AND "division" IN (${formattedDivisions}) AND "subdivision" BETWEEN $2 AND $3`,
                        [req.query.seasonCode as string, req.query.minSubdivision as string, req.query.maxSubdivision as string]
                    ),
                    new Promise<never>((_, reject) => 
                        setTimeout(() => reject(new Error('Query timeout after 30 seconds')), 30000)
                    )
                ]);
                // Respond with the query result
                res.status(200).json(result.rows);
            } else if (req.query.establishedDate && req.query.goodStanding && req.query.badStanding && req.query.lifetimeMember) {
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
                const lifetimeMember = req.query.lifetimeMember === "true";

                let result;
                let baseQuery = `
                    SELECT DISTINCT "playerId", "fullName", "phoneNumber", email, "addressOne", "addressTwo", city, state, zip
                    FROM public.leda_reports_lists_member_list
                    WHERE "establishedDate" >= $1
                `;
                // By default, exclude lifetime members unless requested
                if (!lifetimeMember) {
                    baseQuery += ` AND "lifetimeMember" = false`;
                }

                if (goodStanding && badStanding) {
                    // No standing filter, include all
                    result = await Promise.race([
                        query<ListsMembership>(baseQuery, [establishedDate]),
                        new Promise<never>((_, reject) => 
                            setTimeout(() => reject(new Error('Query timeout after 30 seconds')), 30000)
                        )
                    ]);
                } else if (goodStanding) {
                    result = await Promise.race([
                        query<ListsMembership>(baseQuery + ` AND "badStanding" = false`, [establishedDate]),
                        new Promise<never>((_, reject) => 
                            setTimeout(() => reject(new Error('Query timeout after 30 seconds')), 30000)
                        )
                    ]);
                } else if (badStanding) {
                    result = await Promise.race([
                        query<ListsMembership>(baseQuery + ` AND "badStanding" = true`, [establishedDate]),
                        new Promise<never>((_, reject) => 
                            setTimeout(() => reject(new Error('Query timeout after 30 seconds')), 30000)
                        )
                    ]);
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
                message: "Failed to fetch membership list",
                error,
            });
        }
    } else {
        // Respond with a 405 status code for unsupported methods
        res.status(405).json({ error: "Method not allowed" });
    }
}