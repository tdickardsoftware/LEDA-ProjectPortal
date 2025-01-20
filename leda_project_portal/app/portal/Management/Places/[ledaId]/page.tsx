import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPlace } from "@/lib/getData";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { ledaId: string } }) {
	const ledaId = await params.ledaId;
	const placeData = await fetchPlace(ledaId);
	if (!placeData) {
		notFound();
	}
	return (
		<div>
			<h1 className="text-4xl">Name: {placeData.name}</h1>
			<h2 className="text-2xl">LEDA ID #{placeData.ledaId}</h2>
			<div className="flex gap-4 py-2">
				<Card>
					<CardHeader>
						<CardTitle>Place Information</CardTitle>
					</CardHeader>
					<CardContent>
						<p>Website: {placeData.website}</p>
						<p>Number of Boards: {placeData.numberOfBoards}</p>
						<p>Email: {placeData.email}</p>
						<p>Phone Number: {placeData.phoneNumber}</p>
						{placeData.otherNumber && (
							<p>Other Number: {placeData.otherNumber}</p>
						)}
						<p>Address One: {placeData.addressOne}</p>
						{placeData.addressTwo && (
							<p>Address Two: {placeData.addressTwo}</p>
						)}
						<p>City: {placeData.city}</p>
						<p>State: {placeData.state}</p>
						<p>Zip: {placeData.zip}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Membership Information</CardTitle>
					</CardHeader>
					<CardContent>
						<p>Place Owner LEDA ID: {placeData.contactId}</p>
						<p>
							Last Bar Fee Payment: {placeData.lastBarFeePayment}
						</p>
						<p>Place Type: {placeData.placeType}</p>
						<p>
							Established Date:{" "}
							{new Date(
								placeData.establishDate
							).toLocaleDateString("en-US")}
						</p>
						<p>
							Last Sanctioning Date:{" "}
							{new Date(
								placeData.lastSanctioningDate
							).toLocaleDateString("en-US")}
						</p>
						<p>
							Send Mailings:{" "}
							{placeData.sendMailings ? "Yes" : "No"}
						</p>
						<p>
							Regular Sponsor:{" "}
							{placeData.regularSponsor ? "Yes" : "No"}
						</p>
						<p>
							Current Sponsor:{" "}
							{placeData.currentSponsor ? "Yes" : "No"}
						</p>
						<p>Issues: {placeData.issues ? "Yes" : "No"}</p>
						{placeData.memo && <p>Memo: {placeData.memo}</p>}
					</CardContent>
				</Card>
			</div>
			<Link
				href="/Portal/Management/Places"
				className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
				prefetch={true}
			>
				Go Back
			</Link>
		</div>
	);
}
