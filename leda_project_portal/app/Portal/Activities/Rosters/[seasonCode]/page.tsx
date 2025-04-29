import RosterPageContent from "@/components/page-content/activities/roster-page-content";
import { rosterRouteServer } from "@/lib/apiRoutes";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ seasonCode: string }>;

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const seasonCode = params.seasonCode;

	const response = await fetch(rosterRouteServer + `?seasonCode=${seasonCode}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
	if (response.status === 404) {
		notFound();
	}
	return (
		<RosterPageContent renderSeasonCode={seasonCode} />
	)
}
