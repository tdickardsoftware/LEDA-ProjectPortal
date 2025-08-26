// Import necessary types and database query function
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/dbTypeGet";
import { minimalUser } from "@/lib/definitions";
import { requireApiSession } from "@/lib/require-session";
import { defineAbilitesFor } from "@/lib/abilities";

// Define the API route handler
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return; // Unauthorized/Forbidden handled in guard

	// Derive effective role (support emulation like other API guards)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const role = ((session as any)?.data?.user?.role as string | undefined)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		?? ((session as any)?.user?.role as string | undefined)
		?? "User";

	const cookieHeader = req.headers["cookie"] as string | undefined;
	let emulatedRole: string | undefined;
	if (cookieHeader) {
		const parts = cookieHeader.split(/;\s*/);
		for (const p of parts) {
			const [k, v] = p.split("=");
			if (k === "emulatedRole") {
				emulatedRole = decodeURIComponent(v ?? "");
				break;
			}
		}
	}
	const allowedToEmulate = role === "Developer" || role === "Office Admin";
	let effectiveRole = role;
	if (allowedToEmulate && emulatedRole) {
		if (
			(role === "Developer" && (emulatedRole === "Office Admin" || emulatedRole === "User")) ||
			(role === "Office Admin" && emulatedRole === "User")
		) {
			effectiveRole = emulatedRole;
		}
	}

	const ability = defineAbilitesFor(effectiveRole);
	if (!ability.can("manage", "Users")) {
		return res.status(403).json({ error: "Forbidden" });
	}
	// Handle GET requests
	if (req.method === "GET") {
		try {
			// Execute the database query to fetch user information
			const result = await query<minimalUser>(
				'SELECT DISTINCT "username", "email" FROM public.user',
			);
			// Respond with the query result
			res.status(200).json(result.rows);
		} catch (error) {
			// Handle any errors that occur during the query
			res.status(500).json({
				message: "Failed to fetch user information",
				error,
			});
		}
	} else {
		// Respond with a 405 status code for unsupported methods
		res.status(405).json({ error: "Method not allowed" });
	}
}