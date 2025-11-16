import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { requireApiSession } from "@/lib/require-session";

interface BatchPlaceResponse {
	ledaId: string;
	name: string;
}

// Batch API endpoint for fetching multiple places at once
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);
	
	if (req.method === "POST") {
		try {
			const { placeIds } = req.body as { placeIds: string[] };
			
			// Validate input
			if (!Array.isArray(placeIds) || placeIds.length === 0) {
				return res.status(400).json({ 
					error: "placeIds array is required and must not be empty" 
				});
			}

			// Remove duplicates and filter out invalid IDs
			const uniquePlaceIds = [...new Set(placeIds)]
				.filter(id => id && typeof id === 'string' && id.trim() !== '');

			if (uniquePlaceIds.length === 0) {
				return res.status(400).json({ 
					error: "No valid place IDs provided" 
				});
			}

			// Limit batch size to prevent abuse
			if (uniquePlaceIds.length > 100) {
				return res.status(400).json({ 
					error: "Maximum 100 place IDs allowed per batch request" 
				});
			}

			// Create parameterized query for batch fetch
			const placeholders = uniquePlaceIds.map((_, index) => `$${index + 1}`).join(', ');
			const batchQuery = `
				SELECT "ledaId", "name" 
				FROM public.leda_place_info 
				WHERE "ledaId" IN (${placeholders})
				ORDER BY "ledaId"
			`;

			// Execute batch query
			const result = await query<BatchPlaceResponse>(batchQuery, uniquePlaceIds);
			
			// Convert to key-value map for easier frontend consumption
			const placesMap: Record<string, string> = {};
			result.rows.forEach((place) => {
				placesMap[place.ledaId] = place.name || "Unnamed Location";
			});

			// Add entries for missing place IDs (not found in database)
			uniquePlaceIds.forEach((placeId) => {
				if (!(placeId in placesMap)) {
					placesMap[placeId] = "Unknown Location";
				}
			});

			res.status(200).json(placesMap);
		} catch (error) {
			console.error("Batch place fetch error:", error);
			res.status(500).json({
				error: "Failed to fetch places",
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed. Use POST." });
	}
}