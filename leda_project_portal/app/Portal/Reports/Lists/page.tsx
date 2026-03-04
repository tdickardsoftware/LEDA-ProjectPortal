/**
 * Lists reports page — view and export list-style reports such as player
 * rosters, team listings, and related league membership data.
 */
import ListsReportLandingContent from "@/components/page-content/reports-content/lists/lists-report-landing-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lists"
}

export default function Page() {
    return (
        <main>
            <div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">
					List Reports
				</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and export all list report information. This section allows you to generate and manage reports related to lists, including detailed statistics and insights.
				</p>
				<Separator />
                <ListsReportLandingContent />
            </div>
        </main>
    );
}