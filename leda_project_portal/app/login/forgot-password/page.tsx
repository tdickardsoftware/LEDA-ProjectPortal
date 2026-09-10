/**
 * Forgot password page — allows users to request a password reset email.
 */
// Import necessary components and types
import ForgotPasswordPageContent from "@/components/page-content/landing-content/forgot-password-page-content";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

// Define metadata for the page
export const metadata: Metadata = {
	title: "Forgot Password",
};

// Define the main page component
export default function Page() {
	return (
		// Main container for the page content
		<main>
            <ForgotPasswordPageContent />
		</main>
	);
}