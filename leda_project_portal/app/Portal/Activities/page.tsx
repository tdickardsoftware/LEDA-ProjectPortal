/**
 * Activities index page — overview of all activity-related sections
 * available in the portal (Payouts, Rosters, Scheduling, Trails, Weekly Score).
 */
import ActivitiesPageContent from "@/components/page-content/landing-content/activities-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Activities | LEDA Project Portal",
};

export default function Page() {
	return (
		<main className="container pl-4">
			<div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">Activities</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage all activities and events related to LEDA
					projects.
				</p>
				<Separator />
			</div>
			<ActivitiesPageContent />
		</main>
	);
}
