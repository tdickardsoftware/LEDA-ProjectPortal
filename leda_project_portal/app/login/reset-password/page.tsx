/**
 * Reset password page — allows users to set a new password via a token-based link.
 * Wrapped in Suspense because the content reads search params on the client.
 */
// Import necessary components and types
import ResetPasswordContent from "@/components/page-content/landing-content/reset-password-content";
import { Metadata } from "next";
import { Suspense } from "react";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

// Define metadata for the page
export const metadata: Metadata = {
	title: "Reset Password"
};

// Define the main page component
export default function Page() {
	return (
		// Main container for the page content
		<main>
			<Suspense fallback={<div>Loading...</div>}>
				<ResetPasswordContent />
			</Suspense>
		</main>
	);
}