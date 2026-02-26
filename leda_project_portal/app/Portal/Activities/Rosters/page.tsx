/**
 * Rosters index page — entry point for viewing and managing team rosters.
 * Selecting a season from the list navigates to the season-specific roster view.
 */
import RostersContent from "@/components/page-content/activities/roster-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Rosters",
};

export default function Page() {
	return (
		<main>
			<div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">Rosters</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage all Roster information.
				</p>
				<Separator />
			</div>
			<RostersContent />
		</main>
	);
}
