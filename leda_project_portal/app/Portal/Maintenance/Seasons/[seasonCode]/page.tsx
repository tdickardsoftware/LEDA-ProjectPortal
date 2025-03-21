import { SeasonPageContent } from "@/components/page-content/maintenance-content/season-view-page-content";
import { fetchSeason } from "@/lib/getData";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ seasonCode: string }>;

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const seasonCode = params.seasonCode;

	const seasonData = await fetchSeason(seasonCode);
	if (!seasonData) {
		notFound();
	}

	return (
		<SeasonPageContent seasonData={seasonData} />
	);
}
