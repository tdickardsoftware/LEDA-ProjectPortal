import TeamPageContent from "@/components/page-content/management-content/team-content/team-view-page-content";
import { teamRoute } from "@/lib/apiRoutes";
import { fetchTeam, fetchWithSession } from "@/lib/getData";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ ledaId: string }>;

interface TeamMember {
	fullName: string;
	ledaId: string;
	isCaptain: boolean;
	cannotBeCaptain: boolean;
	badStanding: boolean;
}

async function TeamData({ ledaId }: { ledaId: string }) {
	const teamData = await fetchTeam(ledaId);
	if (!teamData) {
		notFound();
	}

	const fetchMemberDetails = async () => {
		const res = await fetchWithSession(`${teamRoute}/memberInfo?ledaId=${teamData.ledaId}`);
		if (!res.ok) {
			if (res.status === 404) return [] as TeamMember[]; // graceful empty
			throw new Error("Failed to fetch member details");
		}
		const data = await res.json();
		return data.map((member: TeamMember) => ({
			fullName: member.fullName,
			ledaId: member.ledaId,
			isCaptain: member.isCaptain,
			cannotBeCaptain: member.cannotBeCaptain,
			badStanding: member.badStanding,
		}));
	};

	// Execute the function to get the actual member details
	const memberDetails = await fetchMemberDetails();

	return <TeamPageContent teamData={teamData} memberDetails={memberDetails} />;
}

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const ledaId = params.ledaId;

	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<TeamData ledaId={ledaId} />
		</Suspense>
	);
}
