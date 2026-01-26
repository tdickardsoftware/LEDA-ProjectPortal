// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlayerDataTable } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { parseFieldSearch, buildSQLWhereClause, createColumnMapping } from "@/lib/search-parser";

// Define column mappings for player data
const playerColumnMappings = createColumnMapping([
	{ displayName: "LEDA ID Number", dataKey: "ledaId", variations: [] },
	{ displayName: "Full Name", dataKey: "fullName", variations: [] },
	{ displayName: "Phone Number", dataKey: "phoneNumber", variations: [] },
	{ displayName: "Email", dataKey: "email", variations: [] },
]);

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		try {
			// Parse query parameters
			const page = parseInt(req.query.page as string) || 1;
			const pageSize = parseInt(req.query.pageSize as string) || 10;
			const search = (req.query.search as string) || "";
			const sortBy = (req.query.sortBy as string) || "ledaId";
			const sortDirRaw = ((req.query.sortDir as string) || "asc").toLowerCase();
			const sortDir = sortDirRaw === "desc" ? "DESC" : "ASC";
			const offset = (page - 1) * pageSize;

			const orderByMap: Record<string, string> = {
				ledaId: '"ledaId"',
				fullName: `CONCAT(COALESCE("firstName", ''), ' ', COALESCE("middleInitial", ''), ' ', COALESCE("lastName", ''))`,
				phoneNumber: '"phoneNumber"',
				email: '"email"',
			};
			const orderBySql = orderByMap[sortBy] ?? orderByMap.ledaId;

			// Build search condition
			let searchCondition = "";
			let searchParams: any[] = [];
			
			if (search) {
				// Parse the search query
				const parsedSearch = parseFieldSearch(search, playerColumnMappings);
				
				if (parsedSearch.type === 'general') {
					// General search across all fields
					const searchTerm = `%${parsedSearch.query}%`;
					searchCondition = `WHERE 
						CONCAT(COALESCE("firstName", ''), ' ', COALESCE("middleInitial", ''), ' ', COALESCE("lastName", '')) ILIKE $1
						OR "email" ILIKE $1
						OR "phoneNumber" ILIKE $1
						OR CAST("ledaId" AS TEXT) ILIKE $1`;
					searchParams = [searchTerm];
				} else {
					// Field-specific search
					const { whereClause, params } = buildSQLWhereClause(parsedSearch, playerColumnMappings);
					if (whereClause) {
						searchCondition = `WHERE ${whereClause}`;
						searchParams = params;
					}
				}
			}

			// Get total count
			const countQuery = `SELECT COUNT(*) as total FROM public.leda_player_info ${searchCondition}`;
			const countResult = await query<{ total: string }>(
				countQuery,
				searchParams
			);
			const totalRecords = parseInt(countResult.rows[0]?.total || "0");

			// Execute the database query to fetch paginated player information
			const dataQuery = `
				SELECT 
					"ledaId", 
					CONCAT(COALESCE("firstName", ''), ' ', COALESCE("middleInitial", ''), ' ', COALESCE("lastName", '')) as "fullName", 
					CONCAT('(', SUBSTRING("phoneNumber", 1, 3), ')-', SUBSTRING("phoneNumber", 4, 3), '-', SUBSTRING("phoneNumber", 7, 4)) as "phoneNumber", 
					"email" 
				FROM public.leda_player_info 
				${searchCondition}
				ORDER BY ${orderBySql} ${sortDir}
				LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
			`;
			
			const result = await query<PlayerDataTable>(
				dataQuery,
				[...searchParams, pageSize, offset]
			);

			// Respond with paginated data and metadata
			res.status(200).json({
				data: result.rows,
				pagination: {
					page,
					pageSize,
					totalRecords,
					totalPages: Math.ceil(totalRecords / pageSize),
				},
			});
		} catch (error) {
			// Handle any errors that occur during the query
			console.error("Database query error:", error);
			res.status(500).json({ message: "Failed to fetch players", error });
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}