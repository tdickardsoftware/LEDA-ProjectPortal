/**
 * Portal index page — landing page for authenticated users inside the portal.
 * Displays a welcome/overview area with links to each major portal section.
 */
// Import necessary components and types
import PortalPageContent from "@/components/page-content/landing-content/portal-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

// Define metadata for the page
export const metadata: Metadata = {
	title: "Portal",
};


// Define the main page component
export default function Page() {
	
	return (
		// Main container for the page content
		<main>
			{/* Page title */}
			<h1 className="text-4xl font-bold antialiased">Portal Page</h1>
			{/* Separator line */}
			<Separator className="my-4 bg-muted0" />
			{/* Portal page content */}
			<PortalPageContent />
		</main>
	);
}
