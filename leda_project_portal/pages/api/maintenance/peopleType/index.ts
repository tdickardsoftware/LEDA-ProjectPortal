// Import necessary types and database query functions
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PeopleType } from "@/lib/definitions";
import { queryPost } from "@/lib/query";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Handle GET requests
	if (req.method === "GET") {
		if (req.query.peopleTypeCode) {
			try {
				const peopleTypeCode = req.query.peopleTypeCode;
				const result = await query<PeopleType>(
					`SELECT "peopleTypeCode", "desc" FROM maint.leda_maint_people_types WHERE "peopleTypeCode" = $1;`,
					[peopleTypeCode as string]
				);
				res.status(200).json(result.rows[0]);
			} catch (error) {
				res.status(500).json({
					message: "Failed to fetch people type ",
					error,
				});
			}
		} else {
			try {
				// Execute the database query to fetch people type information
				const result = await query<PeopleType>(
					'SELECT "peopleTypeCode", "desc" FROM maint.leda_maint_people_types ORDER BY "peopleTypeCode";'
				);
				// Respond with the query result
				res.status(200).json(result.rows);
			} catch (error) {
				// Handle any errors that occur during the query
				res.status(500).json({ message: "Failed to fetch people type ", error });
			}
		}
	}
	// Handle POST requests
	else if (req.method === "POST") {
		try {
			console.log(req.body);
			const results = req.body as PeopleType;

			// Define the query to insert a new people type
			const query = `INSERT INTO maint.leda_maint_people_types(
                        "peopleTypeCode", "desc")
                        VALUES ($1, $2);`;
			const values = [results.peopleTypeCode, results.desc];

			// Execute the insert query
			const result = await queryPost(query, values);

			// Respond with the result of the insert operation
			res.status(201).json({ insert1: result });
		} catch (error) {
			// Handle any errors that occur during the insert operation
			console.error("Error in PeopleTypeHandler:", error);
			res.status(500).json({ message: (error as Error).message || "Server error" }); // Send error info in JSON
		}
	} else if (req.method === "DELETE") {
		try {
			const data = req.body as PeopleType;
			const query = `DELETE FROM maint.leda_maint_people_types WHERE "peopleTypeCode" = $1 AND "desc" = $2;`;
			const values = [data.peopleTypeCode, data.desc];
			const result = await queryPost(query, values);
			res.status(201).json({ delete1: result });
		} catch (error) {
			console.error("Error in PeopleTypeHandler:", error as Error);
			res.status(500).json({ message: (error as Error).message || "Server error" });
		}
	} else if (req.method === "PUT") {
		try {
			const data = req.body as PeopleType;
			const query = `UPDATE maint.leda_maint_people_types SET "desc" = $2 WHERE "peopleTypeCode" = $1;`;
			const values = [data.peopleTypeCode, data.desc];
			const result = await queryPost(query, values);
			res.status(201).json({ update1: result });
		} catch (error) {
			console.error("Error in PeopleTypeHandler:", error as Error);
			res.status(500).json({ message: (error as Error).message || "Server error" });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
