// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import {  UserRole } from "@/lib/definitions";
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
            if (req.query.username) {
			// Execute the database query to fetch user role information
			const result = await query<UserRole>(
				'SELECT "username", "role" FROM public.user WHERE "username" = $1',
                [req.query.username as string]
			);
			// Respond with the query result
			res.status(200).json(result.rows);
            } else {
                // Execute the database query to fetch user role information
                const result = await query<UserRole>(
                    'SELECT "username", "role" FROM public.user'
                );
                // Respond with the query result
                res.status(200).json(result.rows);
            }
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch user role information",
				error,
			});
		}
	} else if (req.method === "PATCH") {
        await requireApiSession(req, res);
		// Handle PATCH requests
		try {
			// Validate request body
			if (!req.body.username || !req.body.role) {
				return res.status(400).json({ error: "Username and role are required" });
			}
			// Execute the database query to update user role information
			await query<UserRole>(
				'UPDATE public.user SET "role" = $1 WHERE "username" = $2',
				[req.body.role, req.body.username]
			);
			// Respond with a success message
			res.status(200).json({ message: "User role updated successfully" });
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to update user role information",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}