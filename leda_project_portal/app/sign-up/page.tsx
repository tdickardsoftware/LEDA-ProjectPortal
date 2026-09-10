/**
 * Sign-up page — allows new users to create a LEDA portal account.
 * Wrapped in Suspense because signup content may read search params.
 */
// Import necessary components and types
import SignupPageContent from "@/components/page-content/landing-content/signup-page-content";
import { Metadata } from "next";
import { Suspense } from "react";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

// Define metadata for the page
export const metadata: Metadata = {
	title: "Sign-up",
};

// Define the main page component
export default function Page() {
	return (
		// Main container for the page content
		<main>
			<Suspense fallback={<div>Loading...</div>}>
				<SignupPageContent />
			</Suspense>
		</main>
	);
}