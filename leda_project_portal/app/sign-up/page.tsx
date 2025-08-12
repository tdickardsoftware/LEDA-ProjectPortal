// Import necessary components and types
import SignupPageContent from "@/components/page-content/landing-content/signup-page-content";
import { Metadata } from "next";

// Define metadata for the page
export const metadata: Metadata = {
	title: "Sign-up",
};

// Define the main page component
export default function Page() {
	return (
		// Main container for the page content
		<main>
            <SignupPageContent />
		</main>
	);
}