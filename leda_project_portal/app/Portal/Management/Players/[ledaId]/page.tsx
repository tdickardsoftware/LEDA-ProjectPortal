import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPlayerMember } from "@/lib/getData";
import Link from "next/link";
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
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold mb-4">Name: {playerData.fullName}</h1>
			<h2 className="text-2xl font-semibold mb-6">LEDA ID #{playerData.ledaId}</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle>Player Information</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg">
							Date of Birth:{" "}
							{new Date(playerData.dateOfBirth).toLocaleDateString("en-US")}
						</p>
						<p className="text-lg">Email: {playerData.email}</p>
						<p className="text-lg">Phone Number: {playerData.phoneNumber}</p>
						{playerData.otherNumber && (
							<p className="text-lg">Other Number: {playerData.otherNumber}</p>
						)}
						<p className="text-lg">Address One: {playerData.addressOne}</p>
						{playerData.addressTwo && (
							<p className="text-lg">Address Two: {playerData.addressTwo}</p>
						)}
						<p className="text-lg">City: {playerData.city}</p>
						<p className="text-lg">State: {playerData.state}</p>
						<p className="text-lg">Zip: {playerData.zip}</p>
					</CardContent>
				</Card>
				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle>Membership Information</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg">
							Established Date:{" "}
							{new Date(playerData.establishedDate).toLocaleDateString("en-US")}
						</p>
						<p className="text-lg">
							Bad Standing: {playerData.badStanding ? "Yes" : "No"}
						</p>
						{playerData.badStanding && (
							<p className="text-lg">
								Bad Standing Reason: {playerData.badStandingReason}
							</p>
						)}
						<p className="text-lg">
							Take Off Mailing: {playerData.takeOffMailing ? "Yes" : "No"}
						</p>
						<p className="text-lg">
							Mail Standings: {playerData.mailStandings ? "Yes" : "No"}
						</p>
						<p className="text-lg">
							Form On File: {playerData.formOnFile ? "Yes" : "No"}
						</p>
						<p className="text-lg">
							Needs Member Card: {playerData.needsMemberCard ? "Yes" : "No"}
						</p>
						<p className="text-lg">
							Inactive Date:{" "}
							{playerData.inactiveDate
								? new Date(playerData.inactiveDate).toLocaleDateString("en-US")
								: "N/A"}
						</p>
						<p className="text-lg">
							Last Membership Fee Payment: {playerData.lastMembershipFeePayment}
						</p>
						<p className="text-lg">
							Last Trails Date:{" "}
							{playerData.lastTrailsDate
								? new Date(playerData.lastTrailsDate).toLocaleDateString("en-US")
								: "N/A"}
						</p>
						<p className="text-lg">Member Type: {playerData.memberType}</p>
						<p className="text-lg">
							Cannot Be Captain: {playerData.cannotBeCaptain ? "Yes" : "No"}
						</p>
						<p className="text-lg">
							Lifetime Member: {playerData.lifetimeMember ? "Yes" : "No"}
						</p>
						{playerData.lifetimeMember && (
							<p className="text-lg">
								Lifetime Member Reason: {playerData.lifetimeMemberReason}
							</p>
						)}
					</CardContent>
				</Card>
			</div>
			<Link
				href="/Portal/Management/Players"
				className="mt-6 inline-block rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
				prefetch={true}
			>
				Go Back
			</Link>
		</div>
	);
}
