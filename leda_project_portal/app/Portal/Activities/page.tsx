import ActivitiesPageContent from "@/components/landing-content/activities-page-content";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Activities"
}

export default function Page() {
    return (
        <main>
			<h1 className="text-4xl font-bold antialiased">Management Page</h1>
			{/* Separator line */}
			<Separator className="my-4 bg-gray-500" />
			<ActivitiesPageContent />
		</main>
    );
}