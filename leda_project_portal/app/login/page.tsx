// Import necessary components and types
import LoginPageContent from "@/components/page-content/landing-content/login-page-content";
import { Metadata } from "next";

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