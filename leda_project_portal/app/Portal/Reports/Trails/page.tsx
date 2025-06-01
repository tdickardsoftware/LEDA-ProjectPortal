import TrailsReportLandingContent from "@/components/page-content/reports-content/trails/trails-report-landing-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trails"
}

export default function Page() {
    return (
        <main>
            <div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">
					Trails Reports
				</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and export all trails report information. This section allows you to generate and manage reports related to trails, including detailed statistics and insights.
				</p>
				<Separator />
                <TrailsReportLandingContent />
            </div>
        </main>
    );
}