import ManagementPageContent from "@/components/landing-content/management-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Management",
};

export const dynamic = 'force-dynamic'

export default async function Page() {
	return (
		<main>
			<h1 className="text-4xl font-bold antialiased">Management Page</h1>
			{/* Separator line */}
			<Separator className="my-4 bg-gray-500" />
			<ManagementPageContent />
		</main>
	);
}
