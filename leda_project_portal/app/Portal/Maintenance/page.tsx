import { Metadata } from "next";
import MaintenancePageContent from "@/components/landing-content/maintenance-page-content";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
	title: "Maintenance",
};

export default function Page() {
	return (
		<main>
			<h1 className="text-4xl font-bold antialiased">Maintenance Page</h1>
			{/* Separator line */}
			<Separator className="my-4 bg-gray-500" />
			<MaintenancePageContent />
		</main>
	);
}
