/**
 * Season Calendar page — view and manage the calendar for blocking out days
 * that affect season scheduling.
 */
import CalendarPageContent from "@/components/page-content/maintenance-content/calendar-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Calendar",
};

export default function Page() {
	return (
		<main>
			<div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">
					Calendar
				</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage calendar to block days.
				</p>
				<Separator />
				<CalendarPageContent />
			</div>
		</main>
	);
}
