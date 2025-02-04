import ReportsPageContent from "@/components/landing-content/reports-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reports"
}

export default function Page() {
    return (
        <main>
            {/* Page title */}
			<h1 className="text-4xl font-bold antialiased">Reports Page</h1>
			{/* Separator line */}
			<Separator className="my-4 bg-gray-500" />
            {/* Reports page content */}
            <ReportsPageContent />
        </main>
    );
}