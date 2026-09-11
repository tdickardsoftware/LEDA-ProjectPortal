/**
 * Login page — renders the authentication form for portal access.
 */
// Import necessary components and types
import LoginPageContent from "@/components/page-content/landing-content/login-page-content";
import { Metadata } from "next";
import { Suspense } from "react";

// Define metadata for the page
export const metadata: Metadata = {
	title: "Login",
};

// Define the main page component
export default function Page() {
	return (
		// Main container for the page content
		<main>
			{/* Suspense required because LoginPageContent reads the ?redirect search param on the client */}
			<Suspense fallback={<div>Loading...</div>}>
				<LoginPageContent />
			</Suspense>
		</main>
	);
}