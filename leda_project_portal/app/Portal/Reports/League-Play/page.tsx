/**
 * League Play reports page — view and export reports related to in-season
 * league play activity, including standings and performance statistics.
 */
import LeaguePlayReportLandingContent from "@/components/page-content/reports-content/league-play/league-play-report-landing-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "League Play"
}

export default function Page() {
    return (
        <main>
            <div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">
					League Play Reports
				</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and export all league play report information. This section allows you to generate and manage reports related to league play, including detailed statistics and insights.
				</p>
				<Separator />
                <LeaguePlayReportLandingContent />
            </div>
        </main>
    );
}