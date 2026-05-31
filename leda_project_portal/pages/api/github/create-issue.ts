/**
 * API Route: /api/github/create-issue
 *
 * POST — Creates a new GitHub issue in the configured repository.
 * Requires an authenticated session. Prepends the reporter's name and
 * email to the issue body before forwarding to the GitHub REST API.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { requireApiSession } from "@/lib/require-session";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/github/create-issue");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireApiSession(req, res);
	if (!session) return;

	if (req.method !== "POST") {
		log.warn({ method: req.method }, "Method not allowed");
		return res.status(405).json({ error: "Method not allowed" });
	}

	log.info({ method: "POST" }, "Create GitHub issue");
	const { title, body, type } = req.body;

	if (!title || !body) {
		return res.status(400).json({ error: "Title and body are required" });
	}

	const labels = type === "enhancement" ? ["enhancement"] : ["bug"];

	const githubToken = process.env.GITHUB_PT;
	const githubRepo = process.env.GITHUB_REPO; // e.g., "owner/repo"

	if (!githubToken || !githubRepo) {
		log.error({ githubToken: !!githubToken, githubRepo: !!githubRepo }, "GitHub configuration missing");
		return res.status(500).json({ 
			error: "GitHub integration not configured" 
		});
	}

	try {
		const response = await fetch(
			`https://api.github.com/repos/${githubRepo}/issues`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${githubToken}`,
					Accept: "application/vnd.github.v3+json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title,
					body: `**Reported by:** ${session.user.name} (${session.user.email})\n\n${body}`,
					labels,
					assignees: ["tdickardsoftware"],
				}),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData);
		}

		const issue = await response.json();

		res.status(201).json({
			success: true,
			issueUrl: issue.html_url,
			issueNumber: issue.number
		});
	} catch (error) {
		log.error({ err: error }, "Failed to create GitHub issue");
		res.status(500).json({ 
			error: (error as Error).message || "Failed to create issue" 
		});
	}
}
