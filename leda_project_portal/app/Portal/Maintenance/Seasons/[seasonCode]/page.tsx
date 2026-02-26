/**
 * Season detail page — fetches the specified season by seasonCode and renders
 * its detailed view. Triggers a 404 if the season is not found.
 * Uses Suspense to show a spinner while data is loading server-side.
 */
import { SeasonPageContent } from "@/components/page-content/maintenance-content/season-view-page-content";
import { fetchSeason } from "@/lib/getData";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ seasonCode: string }>;

async function SeasonData({ seasonCode }: { seasonCode: string }) {
	const seasonData = await fetchSeason(seasonCode);
	if (!seasonData) {
		notFound();
	}

	return <SeasonPageContent seasonData={seasonData} />;
}

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const seasonCode = params.seasonCode;

	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<SeasonData seasonCode={seasonCode} />
		</Suspense>
	);
}
