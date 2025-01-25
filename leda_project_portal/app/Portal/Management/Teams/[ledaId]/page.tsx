import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTeam, fetchPlayerMember } from "@/lib/getData";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Link from "next/link";
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
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold mb-4">Team Name: {teamData.teamName}</h1>
			<h2 className="text-2xl font-semibold mb-6">LEDA ID #{teamData.ledaId}</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle>Team Information</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg">
							Established Date:{" "}
							{new Date(
								teamData.establishedDate
							).toLocaleDateString("en-US")}
						</p>
						<p className="text-lg">Last Team Fee Payment: {teamData.lastTeamFeePayment}</p>
						{teamData.memo && <p className="text-lg">Memo: {teamData.memo}</p>}
					</CardContent>
				</Card>
				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle>Team Member Information</CardTitle>
					</CardHeader>
					<CardContent>
						{memberDetails.map((member) => (
							<p key={member.ledaId} className="text-lg flex items-center">
								{member.fullName} (LEDA ID: {member.ledaId}) {member.isCaptain && <Star className={cn("h-4 w-4 text-yellow-500")} />}
							</p>
						))}
					</CardContent>
				</Card>
			</div>
			<Link
				href="/Portal/Management/Teams"
				className="mt-6 inline-block rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
				prefetch={true}
			>
				Go Back
			</Link>
		</div>
	);
}
