/**
 * Rosters index page — entry point for viewing and managing team rosters.
 * Selecting a season from the list navigates to the season-specific roster view.
 */
import RostersContent from "@/components/page-content/activities/roster-page-content";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Rosters",
};

type SearchParamsProps = Promise<{ divisionName?: string; subdivisionName?: string }>;

async function RostersData({ searchParams }: { searchParams: SearchParamsProps }) {
	const { divisionName, subdivisionName } = await searchParams;
	return (
		<RostersContent
			initialDivisionName={divisionName}
			initialSubdivisionName={subdivisionName}
		/>
	);
}

export default function Page(props: { searchParams: SearchParamsProps }) {
	return (
		<main>
			<div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">Rosters</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage all Roster information.
				</p>
				<Separator />
			</div>
			<Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><Spinner /></div>}>
				<RostersData searchParams={props.searchParams} />
			</Suspense>
		</main>
	);
}
