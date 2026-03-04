// TODO - Implement Caldendar API

// POST - date and desc

// GET - list of dates with desc (will show up on a calendar) (only pull dates for the year the calendar is being viewed in)
// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Calendar } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import { DatabaseError } from "pg";
import { requireApiSession } from "@/lib/require-session";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;
	// Handle GET requests
	if (req.method === "GET") {
        if (req.query.year) {
            try {
                // Execute the database query to fetch division information
                const result = await query<Calendar>(
                    'SELECT "date", "desc" FROM maint.leda_maint_calendar WHERE EXTRACT(YEAR FROM "date") = $1;',
                    [ req.query.year as string ]

                );
                // Respond with the query result
                res.status(200).json(result.rows);
            } catch (error) {
                // Handle any errors that occur during the query
                res.status(500).json({ error: (error as Error).message });
            }
        }
        else {
            res.status(400).json({ error: "Year query parameter is required" });
        }
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			const results = req.body as Calendar;

			// Define the query to insert a new calendar entry
			const query = `INSERT INTO maint.leda_maint_calendar(
                        "date", "desc")
                        VALUES ($1, $2);`;
			const values = [results.date, results.desc];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "calendar entry already exists",
				});
			}
			res.status(500).json({
				message: (error as Error).message || "Server error",
			}); // Send error info in JSON
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Calendar;
			const query = `DELETE FROM maint.leda_maint_calendar WHERE "date" = $1;`;
			const values = [data.date];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in CalendarHandler:", error as Error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
