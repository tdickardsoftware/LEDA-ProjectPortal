import { Separator } from "@/components/ui/separator";
import UnderConstruction from "@/components/ui/under-construction";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payments"
}

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
            <UnderConstruction />
        </main>
    );
}