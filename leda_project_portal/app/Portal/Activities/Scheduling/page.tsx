/**
 * Scheduling page — view and manage all schedule information for the current
 * season, including team match assignments.
 */
import ScheduleContent from "@/components/page-content/activities/schedule-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Scheduling",
};

export default function Page() {
	return (
		<main>
			<div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">Scheduling</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage all Schedule information.
				</p>
				<Separator />
			</div>
			<ScheduleContent />
		</main>
	);
}
