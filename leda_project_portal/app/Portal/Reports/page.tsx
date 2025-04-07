import ReportsPageContent from "@/components/page-content/landing-content/reports-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reports"
}

export default function Page() {
    return (
        <main className="container pl-4">
            <div className="mb-6 py-2">
                <h1 className="text-4xl font-bold antialiased">Reports</h1>
                <p className="text-muted-foreground mt-2 mb-4">
                    Generate any Reports with data typically from Activities.
                </p>
                <Separator />
            </div>
            {/* Reports page content */}
            <ReportsPageContent />
        </main>
    );
}