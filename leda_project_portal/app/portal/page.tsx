import PortalPageContent from "@/components/ui/portal-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Portal"
}

export default function Page() {
    return (
        <main>
            <h1 className="text-4xl font-bold antialiased">Portal Page</h1>
            <Separator className="my-4 bg-gray-500" />
            <PortalPageContent />
        </main>
    );
}