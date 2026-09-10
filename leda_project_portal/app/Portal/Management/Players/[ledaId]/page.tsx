/**
 * Player detail page — fetches the specified player member by LEDA ID and renders
 * their detailed profile view. Triggers a 404 if the player is not found.
 * Uses Suspense to show a spinner while data is loading server-side.
 */
import PlayerPageContent from "@/components/page-content/management-content/player-content/player-view-page-content";
import { fetchPlayerMember } from "@/lib/getData";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

type PageProps = Promise<{ ledaId: string }>;

async function PlayerData({ params }: { params: PageProps }) {
	const { ledaId } = await params;
	const playerData = await fetchPlayerMember(ledaId);
	if (!playerData) {
		notFound();
	}

	return <PlayerPageContent playerData={playerData} />;
}

export default function Page(props: { params: PageProps }) {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<PlayerData params={props.params} />
		</Suspense>
	);
}
