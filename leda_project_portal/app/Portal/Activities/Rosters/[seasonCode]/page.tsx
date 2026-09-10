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

async function Roster({ params }: { params: PageProps }) {
	const { seasonCode } = await params;
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

export default function Page(props: { params: PageProps }) {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<Roster params={props.params} />
		</Suspense>
	);
}
