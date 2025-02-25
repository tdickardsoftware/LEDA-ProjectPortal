import TrailsPageContent from "@/components/landing-content/trails-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trails"
}

export default function Page() {
    return (
        <main>{/* Page title */}
            <h1 className="text-4xl font-bold antialiased">Trails Page</h1>
            {/* Separator line */}
            <Separator className="my-4 bg-gray-500" />
            {/* Trails page content */}
            <TrailsPageContent />
        </main>
    );
}