/**
 * Login page — renders the authentication form for portal access.
 */
// Import necessary components and types
import LoginPageContent from "@/components/page-content/landing-content/login-page-content";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

// Define metadata for the page
export const metadata: Metadata = {
	title: "Login",
};

// Define the main page component
export default function Page() {
	return (
		// Main container for the page content
		<main>
            <LoginPageContent />
		</main>
	);
}