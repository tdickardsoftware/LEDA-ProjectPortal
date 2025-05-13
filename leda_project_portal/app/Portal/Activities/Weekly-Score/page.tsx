import WeeklyScoresheetsContent from "@/components/page-content/activities/weekly-scoreesheets-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Weekly Scoresheets",
};

export default function Page() {
	return (
		<main>
			<div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">
					Weekly Scoresheets
				</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage all scoresheet information on a week by week
					basis.
				</p>
				<Separator />
				<WeeklyScoresheetsContent />
			</div>
		</main>
	);
}
