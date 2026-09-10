/**
 * Maintenance index page — overview of all lookup/reference data management
 * sections (Divisions, Mentions, Payment Types, Payments, Seasons, etc.).
 */
import { Metadata } from "next";
import MaintenancePageContent from "@/components/page-content/landing-content/maintenance-page-content";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
	title: "Maintenance",
};

export default function Page() {
	return (
		<main className="container pl-4">
			<div className="mb-6 py-2">
				<h1 className="text-4xl font-bold antialiased">Maintenance</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage all typlically hard coded values used in
					Activities/Player information.
				</p>
				<Separator />
			</div>
			<MaintenancePageContent />
		</main>
	);
}
