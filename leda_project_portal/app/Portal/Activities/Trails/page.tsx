import TrailsPageContent from "@/components/page-content/activities/trails-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Trails",
};

export default function Page() {
	return (
		<main>
			{/* Page title */}
			<div className="mb-6 py-2 ">
				<h1 className="text-4xl font-bold antialiased">Trails</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage all Trails information.
				</p>
				<Separator />
			</div>
			{/* Trails page content */}
			<TrailsPageContent />
		</main>
	);
}
