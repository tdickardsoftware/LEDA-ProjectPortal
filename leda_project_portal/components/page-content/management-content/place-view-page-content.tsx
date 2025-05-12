"use client";

import { Place } from "@/lib/definitions";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components//ui/card";
import PlaceEditForm from "@/components/forms/management/place-edit-form";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderTabMed } from "@/components/ui/folder-tab";
import PaymentHistoryFormDialog from "@/components/payment-history-form-dialog";
import { placePaymentHistoryRoute } from "@/lib/apiRoutes";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function PlacePageContent({ placeData }: { placeData: Place }) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const handleEdit = () => {
		setIsEditDialogOpen(!isEditDialogOpen);
	};

	const handleRefresh = () => {
		window.location.reload();
	};

	return (
		<div className="container mx-auto p-6">
			<div>
				<h1 className="text-4xl font-bold mb-4">
					Name: {placeData.name}
				</h1>
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-semibold mb-6">
						LEDA ID #{placeData.ledaId}
					</h2>
				</div>
				<div className="flex justify-center pb-4">
					<FolderTabMed title="Place Actions">
						<div className="flex gap-2">
							<Button
								onClick={handleEdit}
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
							>
								Edit Place
							</Button>
							<PaymentHistoryFormDialog
								buttonText="Add Place Payment"
								initialLedaId={placeData.ledaId.toString()}
								route={placePaymentHistoryRoute}
								type="place"
							/>
						</div>
					</FolderTabMed>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="shadow-md border border-gray-300 hover:bg-gray-50 transition-colors">
						<CardHeader>
							<CardTitle>Place Information</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-lg">
								Website: {placeData.website}
							</p>
							<p className="text-lg">
								Number of Boards: {placeData.numberOfBoards}
							</p>
							<p className="text-lg">
								Email: {placeData.email}
							</p>
							<p className="text-lg">
								Phone Number: {placeData.phoneNumber}
							</p>
							{placeData.otherNumber && (
								<p className="text-lg">
									Other Number: {placeData.otherNumber}
								</p>
							)}
							<p className="text-lg">
								Address One: {placeData.addressOne}
							</p>
							{placeData.addressTwo && (
								<p className="text-lg">
									Address Two: {placeData.addressTwo}
								</p>
							)}
							<p className="text-lg">
								City: {placeData.city}
							</p>
							<p className="text-lg">
								State: {placeData.state}
							</p>
							<p className="text-lg">Zip: {placeData.zip}</p>
						</CardContent>
					</Card>
					<Card className="shadow-md border border-gray-300 hover:bg-gray-50 transition-colors">
						<CardHeader>
							<CardTitle>Membership Information</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-lg">
								Place Owner LEDA ID: {placeData.contactId}
							</p>
							<p className="text-lg">
								Last Bar Fee Payment:{" "}
								{placeData.lastBarFeePayment}
							</p>
							<p className="text-lg">
								Place Type: {placeData.placeType}
							</p>
							<p className="text-lg">
								Established Date:{" "}
								{new Date(
									placeData.establishDate
								).toLocaleDateString("en-US")}
							</p>
							<p className="text-lg">
								Last Sanctioning Date:{" "}
								{new Date(
									placeData.lastSanctioningDate
								).toLocaleDateString("en-US")}
							</p>
							<p className="text-lg">
								Send Mailings:{" "}
								{placeData.sendMailings ? "Yes" : "No"}
							</p>
							<p className="text-lg">
								Regular Sponsor:{" "}
								{placeData.regularSponsor ? "Yes" : "No"}
							</p>
							<p className="text-lg">
								Current Sponsor:{" "}
								{placeData.currentSponsor ? "Yes" : "No"}
							</p>
							<p className="text-lg">
								Issues: {placeData.issues ? "Yes" : "No"}
							</p>
							{placeData.memo && (
								<p className="text-lg">
									Memo: {placeData.memo}
								</p>
							)}
						</CardContent>
					</Card>
				</div>
				<div className="mt-6">
					<Button className="hover:bg-gray-100 border-gray-300 text-gray-700" asChild>
						<Link
							href="/Portal/Management/Places"
							prefetch={true}
						>
							Go Back
						</Link>
					</Button>
				</div>
			</div>

			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="w-fit bg-white">
					<DialogHeader>
						<DialogTitle>Edit Place: {placeData.name}</DialogTitle>
					</DialogHeader>
					<PlaceEditForm
						rowData={placeData}
						handleEdit={handleEdit}
						onRefresh={handleRefresh}
						onClose={handleEdit}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
