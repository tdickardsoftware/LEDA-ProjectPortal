import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPlace } from "@/lib/getData";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = Promise<{ ledaId: string }>;

export default async function Page(props: { params: PageProps }) {
	const params = await props.params;
	const ledaId = params.ledaId;

	const placeData = await fetchPlace(ledaId);
	if (!placeData) {
		notFound();
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-4xl font-bold mb-4">Name: {placeData.name}</h1>
			<h2 className="text-2xl font-semibold mb-6">LEDA ID #{placeData.ledaId}</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle>Place Information</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg">Website: {placeData.website}</p>
						<p className="text-lg">Number of Boards: {placeData.numberOfBoards}</p>
						<p className="text-lg">Email: {placeData.email}</p>
						<p className="text-lg">Phone Number: {placeData.phoneNumber}</p>
						{placeData.otherNumber && (
							<p className="text-lg">Other Number: {placeData.otherNumber}</p>
						)}
						<p className="text-lg">Address One: {placeData.addressOne}</p>
						{placeData.addressTwo && (
							<p className="text-lg">Address Two: {placeData.addressTwo}</p>
						)}
						<p className="text-lg">City: {placeData.city}</p>
						<p className="text-lg">State: {placeData.state}</p>
						<p className="text-lg">Zip: {placeData.zip}</p>
					</CardContent>
				</Card>
				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle>Membership Information</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg">Place Owner LEDA ID: {placeData.contactId}</p>
						<p className="text-lg">Last Bar Fee Payment: {placeData.lastBarFeePayment}</p>
						<p className="text-lg">Place Type: {placeData.placeType}</p>
						<p className="text-lg">
							Established Date:{" "}
							{new Date(placeData.establishDate).toLocaleDateString("en-US")}
						</p>
						<p className="text-lg">
							Last Sanctioning Date:{" "}
							{new Date(placeData.lastSanctioningDate).toLocaleDateString("en-US")}
						</p>
						<p className="text-lg">
							Send Mailings: {placeData.sendMailings ? "Yes" : "No"}
						</p>
						<p className="text-lg">
							Regular Sponsor: {placeData.regularSponsor ? "Yes" : "No"}
						</p>
						<p className="text-lg">
							Current Sponsor: {placeData.currentSponsor ? "Yes" : "No"}
						</p>
						<p className="text-lg">Issues: {placeData.issues ? "Yes" : "No"}</p>
						{placeData.memo && <p className="text-lg">Memo: {placeData.memo}</p>}
					</CardContent>
				</Card>
			</div>
			<Link
				href="/Portal/Management/Places"
				className="mt-6 inline-block rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
				prefetch={true}
			>
				Go Back
			</Link>
		</div>
	);
}
