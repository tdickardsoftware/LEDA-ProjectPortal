import { Separator } from "@/components/ui/separator";
import UnderConstruction from "@/components/ui/under-construction";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Maintenance"
}

export default function Page() {
    return (
        <main className="container pl-4">
            <div className="mb-6 py-2">
                <h1 className="text-4xl font-bold antialiased">WEBSITE IS CURRENTLY DOWN</h1>
                <p className="text-muted-foreground mt-2 mb-4">
                    Will be back up shortly. Please check back later.
                </p>
                <Separator />
            </div>
            <UnderConstruction />
        </main>
    );
}