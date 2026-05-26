/**
 * Team detail page — fetches team data and member details by LEDA ID, then
 * renders the team profile view. Member details are fetched separately via
 * the team memberInfo endpoint. Triggers a 404 if the team is not found.
 */
import TeamPageContent from "@/components/page-content/management-content/team-content/team-view-page-content";
import { teamRoute } from "@/lib/apiRoutes";
import { fetchTeam, fetchWithSession } from "@/lib/getData";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ ledaId: string }>;
type SearchParamsProps = Promise<{ from?: string; divisionName?: string; subdivisionName?: string }>;

interface TeamMember {
	fullName: string;
	ledaId: string;
	isCaptain: boolean;
	cannotBeCaptain: boolean;
	badStanding: boolean;
}

async function TeamData({ ledaId, backHref }: { ledaId: string; backHref: string }) {
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

	return <TeamPageContent teamData={teamData} memberDetails={memberDetails} backHref={backHref} />;
}

export default async function Page(props: { params: PageProps; searchParams: SearchParamsProps }) {
	const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
	const ledaId = params.ledaId;

	let backHref = "/Portal/Management/Teams";
	if (searchParams.from === "roster" && searchParams.divisionName && searchParams.subdivisionName) {
		backHref = `/Portal/Activities/Rosters?divisionName=${encodeURIComponent(searchParams.divisionName)}&subdivisionName=${encodeURIComponent(searchParams.subdivisionName)}`;
	}

	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<TeamData ledaId={ledaId} backHref={backHref} />
		</Suspense>
	);
}
