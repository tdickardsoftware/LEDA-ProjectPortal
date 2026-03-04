// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { Team } from "@/lib/definitions";
import { queryPost } from "@/lib/query";
import getNextLedaId from "@/lib/getNextLedaId";
import { DatabaseError } from "pg";
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
			if (req.query.ledaId) {
				// Extract the ledaId from the query parameters
				const ledaId = req.query.ledaId;
				// Execute the database query to fetch team information
				const result = await query<Team>(
					`SELECT "ledaId", "teamName", TO_CHAR("establishedDate", 'mm/dd/yyyy') as "establishedDate", "memo", "lastTeamFeePayment", "memberIdList" FROM public.leda_team_info WHERE "ledaId" = $1;`,
					[ledaId as string]
				);
				// Respond with the query result
				res.status(200).json(result.rows[0]);
			} else {
				// Execute the database query to fetch team information
				const result = await query<Team>(
					`SELECT "ledaId", "teamName", TO_CHAR("establishedDate", 'mm/dd/yyyy') as "establishedDate", "memo", "lastTeamFeePayment", "memberIdList" FROM public.leda_team_info ORDER BY "ledaId";`
				);
				// Respond with the query result
				res.status(200).json(result.rows);
			}
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch team info ",
				error,
			});
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			const results = req.body as Team;

			// Generate a new ledaId if it is not provided
			if (results.ledaId === 0) {
				results.ledaId = await getNextLedaId("leda_team_info");
			}

			// Define the query to insert a new team
			const query = `INSERT INTO public.leda_team_info(
                        "ledaId", "teamName", "establishedDate", memo, "lastTeamFeePayment", "memberIdList")
                        VALUES ($1, $2, $3, $4, $5, $6);`;
			const values = [
				results.ledaId,
				results.teamName,
				results.establishedDate,
				results.memo,
				results.lastTeamFeePayment,
				results.memberIdList,
			];
			// Execute the insert query
			const result = await queryPost(query, values);
			// Respond with the result of the insert operation
			res.status(201).json({ insert1: result });
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				res.status(422).json({
					message: "A team with the same ledaId already exists",
				});
			} else {
				res.status(500).json({
					message: (error as Error).message || "Server error",
				}); // Send error info in JSON
			}
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as Team;
			const query = `DELETE FROM public.leda_team_info WHERE "ledaId" = $1;`;
			const values = [data.ledaId];
			const result = await queryPost(query, values);
			res.status(200).json(result);
		} catch (error) {
			console.error("Error in TeamHandler:", error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else if (req.method === "PUT") {
		try {
			const results = req.body as Team;
			const query = `UPDATE public.leda_team_info
				SET "teamName" = $2, "establishedDate" = $3, memo = $4, "memberIdList" = $5
				WHERE "ledaId" = $1;`;
			const values = [
				results.ledaId,
				results.teamName,
				results.establishedDate,
				results.memo,
				results.memberIdList,
			];
			const result = await queryPost(query, values);
			res.status(200).json(result);
		} catch (error) {
			console.error("Error in TeamHandler:", error);
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
