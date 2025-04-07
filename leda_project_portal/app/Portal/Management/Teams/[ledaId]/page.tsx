import TeamPageContent from "@/components/page-content/management-content/team-view-page-content";
import { fetchTeam, fetchPlayerMember } from "@/lib/getData";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ ledaId: string }>;

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const ledaId = params.ledaId;

	const teamData = await fetchTeam(ledaId);
	if (!teamData) {
		notFound();
	}

	const memberDetails = await Promise.all(
		Object.values(teamData.memberIdList).map(async (member) => {
			const playerData = await fetchPlayerMember(member.ledaId);
			return {
				fullName: playerData ? playerData.fullName : "Unknown",
				ledaId: member.ledaId,
				isCaptain: member.isCaptain,
			};
		})
	);

	return (
		<TeamPageContent teamData={teamData} memberDetails={memberDetails} />
	);
}
