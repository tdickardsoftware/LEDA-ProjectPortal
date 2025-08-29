// Import necessary components and types
import ResetPasswordContent from "@/components/page-content/landing-content/reset-password-content";
import { Metadata } from "next";

// Define metadata for the page
export const metadata: Metadata = {
	title: "Reset Password"
};

// Define the main page component
export default function Page() {
	return (
		// Main container for the page content
		<main>
            <ResetPasswordContent />
		</main>
	);
}