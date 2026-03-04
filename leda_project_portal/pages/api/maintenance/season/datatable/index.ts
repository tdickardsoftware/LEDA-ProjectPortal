// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { SeasonDataTable } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { parseFieldSearch, buildSQLWhereClause, createColumnMapping } from "@/lib/search-parser";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/season/datatable");

// Define column mappings for season data
const seasonColumnMappings = createColumnMapping([
	{ displayName: "Season Code", dataKey: "seasonCode", variations: [] },
	{ displayName: "Description", dataKey: "desc", variations: [] },
	{ displayName: "Fiscal Year", dataKey: "fiscalYear", variations: [] },
	{ displayName: "Is Current Season", dataKey: "isCurrentSeason", variations: [] },
]);

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch seasons datatable request");
		try {
			// Parse query parameters
			const page = parseInt(req.query.page as string) || 1;
			const pageSize = parseInt(req.query.pageSize as string) || 10;
			const search = (req.query.search as string) || "";
			const sortBy = (req.query.sortBy as string) || "seasonCode";
			const sortDirRaw = ((req.query.sortDir as string) || "asc").toLowerCase();
			const sortDir = sortDirRaw === "desc" ? "DESC" : "ASC";
			const offset = (page - 1) * pageSize;

			const orderByMap: Record<string, string> = {
				seasonCode: '"seasonCode"',
				desc: '"desc"',
				fiscalYear: '"fiscalYear"',
				isCurrentSeason: '"isCurrentSeason"',
			};
			const orderBySql = orderByMap[sortBy] ?? orderByMap.seasonCode;

			// Build search condition
			let searchCondition = "";
			let searchParams: any[] = [];
			
			if (search) {
				// Parse the search query
				const parsedSearch = parseFieldSearch(search, seasonColumnMappings);
				
				if (parsedSearch.type === 'general') {
					// General search across all fields
					const searchTerm = `%${parsedSearch.query}%`;
					searchCondition = `WHERE 
						"seasonCode" ILIKE $1
						OR "desc" ILIKE $1
						OR "fiscalYear" ILIKE $1`;
					searchParams = [searchTerm];
				} else {
					// Field-specific search
					const { whereClause, params } = buildSQLWhereClause(parsedSearch, seasonColumnMappings);
					if (whereClause) {
						searchCondition = `WHERE ${whereClause}`;
						searchParams = params;
					}
				}
			}

			// Get total count
			const countQuery = `SELECT COUNT(*) as total FROM maint.leda_maint_seasons ${searchCondition}`;
			const countResult = await query<{ total: string }>(
				countQuery,
				searchParams
			);
			const totalRecords = parseInt(countResult.rows[0]?.total || "0");

			// Execute the database query to fetch paginated season information
			const dataQuery = `
				SELECT 
					"seasonCode", 
					"desc", 
					"fiscalYear", 
					"isCurrentSeason" 
				FROM maint.leda_maint_seasons 
				${searchCondition}
				ORDER BY ${orderBySql} ${sortDir}
				LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
			`;
			
			const result = await query<SeasonDataTable>(
				dataQuery,
				[...searchParams, pageSize, offset]
			);

			// Respond with paginated data and metadata
			log.info({ page, pageSize, totalRecords }, "Fetched seasons datatable");
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
			log.error({ err: error }, "Failed to fetch seasons datatable");
			res.status(500).json({
				message: "Failed to fetch seasons",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}