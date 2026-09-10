/**
 * Season-specific weekly scoresheet page — validates the season exists via the
 * roster API route, then renders scoresheet content for the provided seasonCode.
 * Triggers a 404 if the season is not found.
 */
import WeeklyScoresheetsContent from "@/components/page-content/activities/weekly-scoreesheets-content";
import { rosterRouteServer } from "@/lib/apiRoutes";
import { fetchWithSession } from "@/lib/getData";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

type PageProps = Promise<{ seasonCode: string }>;

async function WeeklyScore({ params }: { params: PageProps }) {
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
	return <WeeklyScoresheetsContent renderSeasonCode={seasonCode} />;
}

export default function Page(props: { params: PageProps }) {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<WeeklyScore params={props.params} />
		</Suspense>
	);
}
