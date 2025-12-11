import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { PaymentHistory } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { parseFieldSearch, buildSQLWhereClause, createColumnMapping } from "@/lib/search-parser";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;

	if (req.method === "GET") {
		try {
			const page = parseInt((req.query.page as string) || "1");
			const pageSize = parseInt((req.query.pageSize as string) || "10");
			const search = (req.query.search as string) || "";
			const ledaId = req.query.ledaId as string | undefined;
			const offset = (page - 1) * pageSize;

			// Column mapping for search - using createColumnMapping for search parsing
			const paymentColumnMappings = createColumnMapping([
				{ displayName: "Payment #", dataKey: "paymentNbr", variations: ["paymentNbr", "paymentnbr", "payment", "Payment #", "payment #", "#"] },
				{ displayName: "LEDA ID", dataKey: "ledaId", variations: ["ledaId", "ledaid", "id"] },
				{ displayName: "Name", dataKey: "fullName", variations: ["fullName", "fullname", "name", "teamName", "teamname"] },
				{ displayName: "Amount", dataKey: "amount", variations: ["amount"] },
				{ displayName: "Date", dataKey: "date", variations: ["date"] },
				{ displayName: "Type", dataKey: "type", variations: ["type"] },
				{ displayName: "Season", dataKey: "seasonCode", variations: ["seasonCode", "seasoncode", "season"] },
				{ displayName: "Payment Type", dataKey: "paymentType", variations: ["paymentType", "paymenttype"] },
				{ displayName: "Fiscal Year", dataKey: "fiscalYear", variations: ["fiscalYear", "fiscalyear", "year"] },
			]);

			// SQL column mapping for WHERE clause building (maps dataKey to actual SQL column with aliases)
			const sqlColumnMapping = new Map<string, string>([
				["paymentNbr", 'h."paymentNbr"'],
				["ledaId", 'h."ledaId"'],
				["fullName", 't."teamName"'],
				["amount", 'h."amount"'],
				["date", 'h."date"'],
				["type", 'h."type"'],
				["seasonCode", 'h."seasonCode"'],
				["paymentType", 'h."paymentType"'],
				["fiscalYear", 's."fiscalYear"'],
				["comp", 'h."comp"'],
				["paidOff", 'h."paidOff"'],
				["notes", 'h."notes"'],
			]);

			// Build search condition
			let searchCondition = "";
			let searchParams: string[] = [];

			if (search) {
				const parsedSearch = parseFieldSearch(search, paymentColumnMappings);

				if (parsedSearch.type === 'general') {
					// General search across fields
					const searchTerm = `%${parsedSearch.query}%`;
					searchCondition = `WHERE 
						CAST(h."paymentNbr" AS TEXT) ILIKE $1
						OR CAST(h."ledaId" AS TEXT) ILIKE $1
						OR t."teamName" ILIKE $1
						OR h."type" ILIKE $1
						OR h."seasonCode" ILIKE $1`;
					searchParams = [searchTerm];
				} else {
					// Field-specific search
					const { whereClause, params } = buildSQLWhereClause(parsedSearch, sqlColumnMapping);
					if (whereClause) {
						searchCondition = `WHERE ${whereClause}`;
						searchParams = params;
					}
				}
			}

			// Add ledaId filter if provided
			if (ledaId) {
				const ledaIdCondition = `h."ledaId" = $${searchParams.length + 1}`;
				searchCondition = searchCondition 
					? `${searchCondition} AND ${ledaIdCondition}`
					: `WHERE ${ledaIdCondition}`;
				searchParams.push(ledaId);
			}

			// Count total records
			const countQuery = `
				SELECT COUNT(*) as total
				FROM maint.leda_maint_team_payment_history h
				LEFT JOIN public.leda_team_info t ON h."ledaId" = t."ledaId"
				LEFT JOIN maint.leda_maint_seasons s ON h."seasonCode" = s."seasonCode"
				${searchCondition}
			`;

			const countResult = await query<{ total: string }>(countQuery, searchParams);
			const totalRecords = parseInt(countResult.rows[0]?.total || "0");

			// Fetch paginated data
			const dataQuery = `
				SELECT 
					h."paymentNbr", 
					h."ledaId", 
					h."type", 
					h."paymentType", 
					h."amount", 
					h."seasonCode", 
					h."comp", 
					h."notes", 
					h."paidOff", 
					h."date",
					t."teamName" as "fullName",
					s."fiscalYear"
				FROM maint.leda_maint_team_payment_history h
				LEFT JOIN public.leda_team_info t ON h."ledaId" = t."ledaId"
				LEFT JOIN maint.leda_maint_seasons s ON h."seasonCode" = s."seasonCode"
				${searchCondition}
				ORDER BY h."paymentNbr" DESC
				LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
			`;

			const dataResult = await query<PaymentHistory & { fullName: string; fiscalYear: string }>(
				dataQuery,
				[...searchParams, pageSize.toString(), offset.toString()]
			);

			res.status(200).json({
				data: dataResult.rows,
				pagination: {
					page,
					pageSize,
					totalRecords,
					totalPages: Math.ceil(totalRecords / pageSize),
				},
			});
		} catch (error) {
			console.error("Error fetching team payment history:", error);
			res.status(500).json({
				message: "Failed to fetch team payment history",
				error,
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
