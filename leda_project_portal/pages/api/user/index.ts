/**
 * API Route: /api/user
 *
 * GET  — Returns a distinct list of usernames and emails from the user table.
 *         Requires the caller to have the "manage Users" ability.
 * PATCH — Sets the mustResetPassword flag for one or more users by email.
 *          Admins may update any set of emails; non-admins may only clear
 *          the flag for their own account.
 */
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
		return;
	}

	// Handle PATCH requests (set mustResetPassword for users)
	if (req.method === "PATCH") {
		try {
			const { emails, mustResetPassword } = req.body as { emails?: string[]; mustResetPassword?: boolean };
			if (!Array.isArray(emails) || typeof mustResetPassword !== "boolean") {
				return res.status(400).json({ error: "Invalid payload" });
			}

			// Who is making this request?
			const sessionUserEmail =
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				((session as any)?.data?.user?.email as string | undefined) ??
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				((session as any)?.user?.email as string | undefined);

			// Rules:
			// - Admins (manage Users) can toggle for any list of emails.
			// - A normal user can ONLY set mustResetPassword to false and ONLY for themself.
			const isAdmin = ability.can("manage", "Users");

			if (!isAdmin) {
				if (!sessionUserEmail) return res.status(401).json({ error: "Unauthorized" });
				const uniqueEmails = new Set(emails);
				const selfOnly = uniqueEmails.size === 1 && uniqueEmails.has(sessionUserEmail);
				if (!(selfOnly && mustResetPassword === false)) {
					return res.status(403).json({ error: "Forbidden" });
				}
			}

			// Update users
			const result = await query<{ email: string }>(
				'UPDATE public.user SET "mustResetPassword" = $1 WHERE email = ANY($2::text[]) RETURNING email',
				[
					mustResetPassword as unknown as string | number | boolean | null,
					emails as unknown as string | number | boolean | null,
				]
			);
			return res.status(200).json({ updated: result.rowCount ?? 0, emails: result.rows.map((r) => r.email) });
		} catch (error) {
			return res.status(500).json({ error: "Failed to update users", details: String(error) });
		}
	}

	// Respond with a 405 status code for unsupported methods
	res.status(405).json({ error: "Method not allowed" });
}