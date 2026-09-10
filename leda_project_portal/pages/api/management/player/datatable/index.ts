// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlayerDataTable } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { parseFieldSearch, buildSQLWhereClause, createColumnMapping } from "@/lib/search-parser";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/management/player/datatable");

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
		log.info({ method: "GET", query: req.query }, "Fetch players datatable request");
		try {
			// Parse query parameters
			const page = parseInt(req.query.page as string) || 1;
			const pageSize = parseInt(req.query.pageSize as string) || 10;
			const search = (req.query.search as string) || "";
			const hideInactive = req.query.hideInactive === "true";
			const sortBy = (req.query.sortBy as string) || "ledaId";
			const sortDirRaw = ((req.query.sortDir as string) || "asc").toLowerCase();
			const sortDir = sortDirRaw === "desc" ? "DESC" : "ASC";
			const offset = (page - 1) * pageSize;

			const orderByMap: Record<string, string> = {
				ledaId: 'p."ledaId"',
				fullName: `"fullName"`,
				phoneNumber: '"phoneNumber"',
				email: '"email"',
			};
			const orderBySql = orderByMap[sortBy] ?? orderByMap.ledaId;

			// Build search condition
			let searchClause = "";
			let searchParams: any[] = [];
			
			if (search) {
				// Parse the search query
				const parsedSearch = parseFieldSearch(search, playerColumnMappings);
				
				if (parsedSearch.type === 'general') {
					// General search across all fields
					const searchTerm = `%${parsedSearch.query}%`;
					searchClause = `"fullName" ILIKE $1
						OR "email" ILIKE $1
						OR "phoneNumber" ILIKE $1
						OR CAST(p."ledaId" AS TEXT) ILIKE $1`;
					searchParams = [searchTerm];
				} else {
					// Field-specific search
					const { whereClause, params } = buildSQLWhereClause(parsedSearch, playerColumnMappings, "p");
					if (whereClause) {
						searchClause = whereClause;
						searchParams = params;
					}
				}
			}

			// Combine search and inactive-player filters into a single WHERE clause
			const conditions: string[] = [];
			if (searchClause) conditions.push(`(${searchClause})`);
			if (hideInactive) conditions.push(`(m."inactiveDate" IS NULL OR m."inactiveDate" >= CURRENT_DATE)`);
			const searchCondition = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

			// inactiveDate lives on leda_membership_info, so join it in for the hideInactive filter
			const fromClause = `FROM public.leda_player_info p LEFT JOIN public.leda_membership_info m ON p."ledaId" = m."ledaId"`;

			// Get total count
			const countQuery = `SELECT COUNT(*) as total ${fromClause} ${searchCondition}`;
			const countResult = await query<{ total: string }>(
				countQuery,
				searchParams
			);
			const totalRecords = parseInt(countResult.rows[0]?.total || "0");

			// Execute the database query to fetch paginated player information
			const dataQuery = `
				SELECT 
					p."ledaId", 
					"fullName", 
					CASE WHEN "phoneNumber" ~ '^[0-9]{10}$' THEN '(' || SUBSTRING("phoneNumber", 1, 3) || ')-' || SUBSTRING("phoneNumber", 4, 3) || '-' || SUBSTRING("phoneNumber", 7, 4) ELSE "phoneNumber" END as "phoneNumber", 
					"email" 
				${fromClause}
				${searchCondition}
				ORDER BY ${orderBySql} ${sortDir}
				LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
			`;
			
			const result = await query<PlayerDataTable>(
				dataQuery,
				[...searchParams, pageSize, offset]
			);

			// Respond with paginated data and metadata
			log.info({ page, pageSize, totalRecords }, "Fetched players datatable");
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
			log.error({ err: error }, "Failed to fetch players datatable");
			res.status(500).json({ message: "Failed to fetch players", error });
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}