import PayoutsContent from "@/components/page-content/activities/payouts-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payouts"
}

export default function Page() {
    return (
        <main>
            <div className="mb-6 py-2 ">
                <h1 className="text-4xl font-bold antialiased">Payouts</h1>
                <p className="text-muted-foreground mt-2 mb-4">
                    View and manage all Payout information.
                </p>
                <Separator />
            </div>
            <PayoutsContent />
        </main>
    );
}