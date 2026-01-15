// Import necessary components and types
import ResetPasswordContent from "@/components/page-content/landing-content/reset-password-content";
import { Metadata } from "next";
import { Suspense } from "react";

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