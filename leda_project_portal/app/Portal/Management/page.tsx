/**
 * Management index page — overview of entity management sections
 * for Players, Places, and Teams.
 */
import ManagementPageContent from "@/components/page-content/landing-content/management-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Management",
};

export default async function Page() {
	return (
		<main className="container pl-4">
			<div className="mb-6 py-2">
				<h1 className="text-4xl font-bold antialiased">Management</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage all Player, Place and Team Data.
				</p>
				<Separator />
			</div>
			<ManagementPageContent />
		</main>
	);
}
