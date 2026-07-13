/**
 * API route for updating a season's backup schedule location.
 *
 * PUT - Sets "backupPlaceId" for a given seasonCode. Kept as its own narrow
 *        endpoint (rather than reusing the general season PUT) so callers
 *        that don't have the full season record (desc/fiscalYear/etc.), such
 *        as the schedule page, can update this single field without risking
 *        clobbering the other columns.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { queryPost } from "@/lib/query";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/maintenance/season/backupPlace");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await requireApiSession(req, res);

	if (req.method === "PUT") {
		const { seasonCode, backupPlaceId } = req.body as {
			seasonCode?: string;
			backupPlaceId?: string | null;
		};

		log.info({ method: "PUT", seasonCode, backupPlaceId }, "Update season backup place request");

		if (!seasonCode) {
			res.status(400).json({ message: "seasonCode is required" });
			return;
		}

		try {
			const query = `UPDATE maint.leda_maint_seasons SET "backupPlaceId" = $2 WHERE "seasonCode" = $1;`;
			const result = await queryPost(query, [seasonCode, backupPlaceId || null]);
			log.info({ seasonCode }, "Updated season backup place");
			res.status(200).json(result);
		} catch (error) {
			log.error({ err: error }, "Failed to update season backup place");
			res.status(500).json({
				message: (error as Error).message || "Server error",
			});
		}
	} else {
		log.warn({ method: req.method }, "Method not allowed");
		res.status(405).json({ error: "Method not allowed" });
	}
}
