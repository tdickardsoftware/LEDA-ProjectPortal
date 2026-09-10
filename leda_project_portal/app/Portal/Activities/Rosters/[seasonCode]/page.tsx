/**
 * Season-specific roster page — fetches roster data for the given seasonCode
 * and renders the roster content. Triggers a 404 if the season is not found.
 */
import RosterPageContent from "@/components/page-content/activities/roster-page-content";
import { rosterRouteServer } from "@/lib/apiRoutes";
import { fetchWithSession } from "@/lib/getData";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

type PageProps = Promise<{ seasonCode: string }>;

async function Roster({ seasonCode }: { seasonCode: string }) {
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

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const seasonCode = params.seasonCode;

	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<Roster seasonCode={seasonCode} />
		</Suspense>
	);
}
