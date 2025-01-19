import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPlayerMember } from "@/lib/getData";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { ledaId: string } }) {
	const ledaId = params.ledaId;
	const playerData = await fetchPlayerMember(ledaId);
	if (!playerData) {
		notFound();
	}
	return (
		<div>
			<h1 className="text-4xl">Name: {playerData.fullName}</h1>
			<h2 className="text-2xl">LEDA ID #{playerData.ledaId}</h2>
			<div className="flex gap-4 py-2">
				<Card>
					<CardHeader>
						<CardTitle>Player Information</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							Date of Birth:{" "}
							{new Date(
								playerData.dateOfBirth
							).toLocaleDateString("en-US")}
						</p>
						<p>Email: {playerData.email}</p>
						<p>Phone Number: {playerData.phoneNumber}</p>
						{playerData.otherNumber && (
							<p>Other Number: {playerData.otherNumber}</p>
						)}
						<p>Address One: {playerData.addressOne}</p>
						{playerData.addressTwo && (
							<p>Address Two: {playerData.addressTwo}</p>
						)}
						<p>City: {playerData.city}</p>
						<p>State: {playerData.state}</p>
						<p>Zip: {playerData.zip}</p>
					</CardContent>
				</Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Membership Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Established Date: {new Date(playerData.establishedDate).toLocaleDateString("en-US")}</p>
                        <p>Bad Standing: {playerData.badStanding ? "Yes" : "No"}</p>
                        {playerData.badStanding && <p>Bad Standing Reason: {playerData.badStandingReason}</p>}
                        <p>Take Off Mailing: {playerData.takeOffMailing ? "Yes" : "No"}</p>
                        <p>Mail Standings: {playerData.mailStandings ? "Yes" : "No"}</p>
                        <p>Form On File: {playerData.formOnFile ? "Yes" : "No"}</p>
                        <p>Needs Member Card: {playerData.needsMemberCard ? "Yes" : "No"}</p>
                        <p>Inactive Date: {playerData.inactiveDate ? new Date(playerData.inactiveDate).toLocaleDateString("en-US") : "N/A"}</p>
                        <p>Last Membership Fee Payment: {playerData.lastMembershipFeePayment}</p>
                        <p>Last Trails Date: {playerData.lastTrailsDate ? new Date(playerData.lastTrailsDate).toLocaleDateString("en-US") : "N/A"}</p>
                        <p>Member Type: {playerData.memberType}</p>
                        <p>Cannot Be Captain: {playerData.cannotBeCaptain ? "Yes" : "No"}</p>
                        <p>Lifetime Member: {playerData.lifetimeMember ? "Yes" : "No"}</p>
                        {playerData.lifetimeMember && <p>Lifetime Member Reason: {playerData.lifetimeMemberReason}</p>}
                    </CardContent>
                </Card>
			</div>
			<Link
				href="/Portal/Management/Players"
				className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
			>
				Go Back
			</Link>
		</div>
	);
}
