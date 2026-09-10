/**
 * Payments maintenance page — view and manage payments for teams, players,
 * and places across the league.
 */
import PaymentsPageContent from "@/components/page-content/maintenance-content/payments-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Payments",
};

export default function Page() {
	return (
		<main className="container pl-4">
			<div className="mb-6 py-2">
				<h1 className="text-4xl font-bold antialiased">Payments</h1>
				<p className="text-muted-foreground mt-2 mb-4">
					View and manage payments, for teams, players, and places.
				</p>
				<Separator />
			</div>
			<PaymentsPageContent />
		</main>
	);
}
