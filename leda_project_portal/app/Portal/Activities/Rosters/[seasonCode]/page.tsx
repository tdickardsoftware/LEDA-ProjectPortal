/**
 * Season-specific roster page — fetches roster data for the given seasonCode
 * and renders the roster content. Triggers a 404 if the season is not found.
 */
import RosterPageContent from "@/components/page-content/activities/roster-page-content";
import { rosterRouteServer } from "@/lib/apiRoutes";
import { fetchWithSession } from "@/lib/getData";
import { notFound } from "next/navigation";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type PageProps = Promise<{ seasonCode: string }>;

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const seasonCode = params.seasonCode;

	const response = await fetchWithSession(
		rosterRouteServer + `?seasonCode=${seasonCode}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	if (response.status === 404) {
		notFound();
	}
	return <RosterPageContent renderSeasonCode={seasonCode} />;
}
