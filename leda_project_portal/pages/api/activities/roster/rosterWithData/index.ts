/**
 * API Route: /api/activities/roster/rosterWithData
 *
 * GET — Returns season codes for all rosters where teamInformation is
 *        populated (i.e., the roster has been built out).
 */
import { NextApiRequest, NextApiResponse } from "next";
			);
			res.status(200).json(result.rows);
		} catch (error) {
			res.status(500).json({
				message: "Failed to fetch roster information",
				error,
			});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
