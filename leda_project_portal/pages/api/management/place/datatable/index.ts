// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PlaceDataTable } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { parseFieldSearch, buildSQLWhereClause, createColumnMapping } from "@/lib/search-parser";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/management/place/datatable");

// Define column mappings for place data
const placeColumnMappings = createColumnMapping([
	{ displayName: "LEDA ID Number", dataKey: "ledaId", variations: [] },
	{ displayName: "Name", dataKey: "name", variations: [] },
	{ displayName: "Address", dataKey: "addressFull", variations: [] },
	{ displayName: "Place Type", dataKey: "placeType", variations: [] },
]);

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	// Handle GET requests
	if (req.method === "GET") {
		log.info({ method: "GET", query: req.query }, "Fetch places datatable request");
		try {
			// Parse query parameters
			const page = parseInt(req.query.page as string) || 1;
			const pageSize = parseInt(req.query.pageSize as string) || 10;
			const search = (req.query.search as string) || "";
			const sortBy = (req.query.sortBy as string) || "ledaId";
			const sortDirRaw = ((req.query.sortDir as string) || "asc").toLowerCase();
			const sortDir = sortDirRaw === "desc" ? "DESC" : "ASC";
			const offset = (page - 1) * pageSize;

			const addressExpr = `CONCAT(COALESCE("addressOne", ''), ' ', COALESCE("addressTwo", ''), ', ', COALESCE("city", ''), ' ', COALESCE("state", ''), ', ', COALESCE("zip", ''))`;
			const orderByMap: Record<string, string> = {
				ledaId: '"ledaId"',
				name: '"name"',
				addressFull: addressExpr,
				placeType: '"placeType"',
			};
			const orderBySql = orderByMap[sortBy] ?? orderByMap.ledaId;

			// Build search condition
			let searchCondition = "";
			let searchParams: any[] = [];
			
			if (search) {
				// Parse the search query
				const parsedSearch = parseFieldSearch(search, placeColumnMappings);
				
				if (parsedSearch.type === 'general') {
					// General search across all fields
					const searchTerm = `%${parsedSearch.query}%`;
					searchCondition = `WHERE 
						"name" ILIKE $1
						OR "placeType" ILIKE $1
						OR CAST("ledaId" AS TEXT) ILIKE $1
						OR CONCAT(COALESCE("addressOne", ''), ' ', COALESCE("addressTwo", ''), ', ', COALESCE("city", ''), ' ', COALESCE("state", ''), ', ', COALESCE("zip", '')) ILIKE $1`;
					searchParams = [searchTerm];
				} else {
					// Field-specific search
					const { whereClause, params } = buildSQLWhereClause(parsedSearch, placeColumnMappings);
					if (whereClause) {
						searchCondition = `WHERE ${whereClause}`;
						searchParams = params;
					}
				}
			}

			// Get total count
			const countQuery = `SELECT COUNT(*) as total FROM public.leda_place_info ${searchCondition}`;
			const countResult = await query<{ total: string }>(
				countQuery,
				searchParams
			);
			const totalRecords = parseInt(countResult.rows[0]?.total || "0");

			// Execute the database query to fetch paginated place information
			const dataQuery = `
				SELECT 
					"ledaId", 
					"name", 
					CONCAT(COALESCE("addressOne", ''), ' ', COALESCE("addressTwo", ''), ', ', COALESCE("city", ''), ' ', COALESCE("state", ''), ', ', COALESCE("zip", '')) as "addressFull", 
					"phoneNumber",
					"placeType" 
				FROM public.leda_place_info 
				${searchCondition}
				ORDER BY ${orderBySql} ${sortDir}
				LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
			`;
			
			const result = await query<PlaceDataTable>(
				dataQuery,
				[...searchParams, pageSize, offset]
			);

			// Respond with paginated data and metadata
			log.info({ page, pageSize, totalRecords }, "Fetched places datatable");
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
			log.error({ err: error }, "Failed to fetch places datatable");
			res.status(500).json({ message: "Failed to fetch places", error });
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
