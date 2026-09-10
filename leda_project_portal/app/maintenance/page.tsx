/**
 * Site maintenance page — displayed when the application is temporarily unavailable.
 * Shows an "under construction" notice rather than the normal portal UI.
 */
import { Separator } from "@/components/ui/separator";
import UnderConstruction from "@/components/ui/under-construction";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Maintenance",
};

export default function Page() {
	return (
		<main className="container pl-4">
			<div className="mb-6 py-2">
				<h1 className="text-4xl font-bold antialiased">
					WEBSITE IS CURRENTLY DOWN
				</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					Will be back up shortly. Please check back later.
				</p>
				<Separator />
			</div>
			<UnderConstruction />
		</main>
	);
}
