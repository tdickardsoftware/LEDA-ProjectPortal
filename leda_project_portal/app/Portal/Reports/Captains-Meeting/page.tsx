import CaptainsMeetingReportLandingContent from "@/components/page-content/reports-content/captains-meeting/captains-meeting-report-landing-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Captains Meeting"
}

export default function Page() {
    return (
        <main>
            <div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">
					Captains Meeting Reports
				</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and export all captains meeting report information. This section allows you to generate and manage reports related to captains meeting, including detailed statistics and insights.
				</p>
				<Separator />
                <CaptainsMeetingReportLandingContent />
            </div>
        </main>
    );
}