import PlayerPageContent from "@/components/page-content/management-content/player-view-page-content";
import { fetchPlayerMember } from "@/lib/getData";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ ledaId: string }>;

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const ledaId = params.ledaId;

	const playerData = await fetchPlayerMember(ledaId);
	if (!playerData) {
		notFound();
	}

	return (
		<PlayerPageContent playerData={playerData}/>
	);
}
