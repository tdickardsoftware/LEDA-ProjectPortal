/**
 * Place detail page — fetches the specified place by LEDA ID and renders
 * its detailed view. Triggers a 404 if the place is not found.
 * Uses Suspense to show a spinner while data is loading server-side.
 */
import PlacePageContent from "@/components/page-content/management-content/place-content/place-view-page-content";
import { fetchPlace } from "@/lib/getData";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

type PageProps = Promise<{ ledaId: string }>;

async function PlaceData({ params }: { params: PageProps }) {
	const { ledaId } = await params;
	const placeData = await fetchPlace(ledaId);
	if (!placeData) {
		notFound();
	}

	return <PlacePageContent placeData={placeData} />;
}

export default function Page(props: { params: PageProps }) {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<PlaceData params={props.params} />
		</Suspense>
	);
}
