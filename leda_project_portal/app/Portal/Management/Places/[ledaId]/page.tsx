import PlacePageContent from "@/components/page-content/management-content/place-content/place-view-page-content";
import { fetchPlace } from "@/lib/getData";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ ledaId: string }>;

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const ledaId = params.ledaId;

	const placeData = await fetchPlace(ledaId);
	if (!placeData) {
		notFound();
	}
	

	return (
		<PlacePageContent placeData={placeData}/>
	);
}
