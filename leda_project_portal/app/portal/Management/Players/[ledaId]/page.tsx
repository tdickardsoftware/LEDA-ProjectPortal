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
			<p>LEDA ID # {playerData.ledaId}</p>
			<p>Name: {playerData.fullName}</p>
			<p>
				Date of Birth:{" "}
				{new Date(playerData.dateOfBirth).toLocaleDateString("en-US")}
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
			<Link
				href="/Portal/Management/Players"
				className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
			>
				Go Back
			</Link>
		</div>
	);
}
