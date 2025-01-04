// Import necessary components and types
import PortalPageContent from "@/app/Portal/portal-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

// Define metadata for the page
export const metadata: Metadata = {
    title: "Portal"
}

// Define the main page component
export default function Page() {
    return (
        // Main container for the page content
        <main>
            {/* Page title */}
            <h1 className="text-4xl font-bold antialiased">Portal Page</h1>
            {/* Separator line */}
            <Separator className="my-4 bg-gray-500" />
            {/* Portal page content */}
            <PortalPageContent />
        </main>
    );
}