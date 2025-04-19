"use client";

import { PlayerMemberInfo } from "@/lib/definitions";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components//ui/card";
import PlayerEditForm from "@/components/forms/management/player-edit-form";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderTabMed } from "@/components/ui/folder-tab";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import PlayerTrailsHistoryContent from "./player-trails-history-content";
import PlayerMentionsHistoryContent from "./player-mentions-history-content";
import PlayerTDPHistoryContent from "./player-tdp-history-content";

export default function PlayerPageContent({
	playerData,
}: {
	playerData: PlayerMemberInfo;
}) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isTrailsHistoryDialogOpen, setIsTrailsHistoryDialogOpen] = useState(false);
	const [isMentionsHistoryDialogOpen, setIsMentionsHistoryDialogOpen] = useState(false);
	const [isTDPHistoryDialogOpen, setIsTDPHistoryDialogOpen] = useState(false);

	const handleEdit = () => {
		setIsEditDialogOpen(!isEditDialogOpen);
	};

	const handleTrailsHistory = () => {
		setIsTrailsHistoryDialogOpen(!isTrailsHistoryDialogOpen);
	}

	const handleMentionsHistory = () => {
		setIsMentionsHistoryDialogOpen(!isMentionsHistoryDialogOpen);
	};

	const handleTDPHistory = () => {
		setIsTDPHistoryDialogOpen(!isTDPHistoryDialogOpen);
	}

	const handleRefresh = () => {
		window.location.reload();
	};

	return (
		<div className="container mx-auto p-6">
			<div>
				<h1 className="text-4xl font-bold mb-4">
					Name: {playerData.fullName}
				</h1>
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-semibold mb-6">
						LEDA ID #{playerData.ledaId}
					</h2>
				</div>
				<div className="flex justify-center pb-4">
					<FolderTabMed title="Player Actions">
						<div className="flex gap-2">
							<Button
								onClick={handleEdit}
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
							>
								Edit Player
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
								onClick={handleTrailsHistory}
							>
								Trails History
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
								onClick={handleMentionsHistory}
							>
								Mentions History
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
							>
								Payment History
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
								onClick={handleTDPHistory}
							>
								Top Darter Points History
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
							>
								Roster History
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
							>
								Overall History?
							</Button>
						</div>
					</FolderTabMed>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="shadow-md border border-gray-300 hover:bg-gray-50 transition-colors">
						<CardHeader>
							<CardTitle>Player Information</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-lg">
								Date of Birth:{" "}
								{new Date(
									playerData.dateOfBirth
								).toLocaleDateString("en-US")}
							</p>
							<p className="text-lg">
								Email: {playerData.email}
							</p>
							<p className="text-lg">
								Phone Number: {playerData.phoneNumber}
							</p>
							{playerData.otherNumber && (
								<p className="text-lg">
									Other Number: {playerData.otherNumber}
								</p>
							)}
							<p className="text-lg">
								Address One: {playerData.addressOne}
							</p>
							{playerData.addressTwo && (
								<p className="text-lg">
									Address Two: {playerData.addressTwo}
								</p>
							)}
							<p className="text-lg">
								City: {playerData.city}
							</p>
							<p className="text-lg">
								State: {playerData.state}
							</p>
							<p className="text-lg">Zip: {playerData.zip}</p>
						</CardContent>
					</Card>
					<Card className="shadow-md border border-gray-300 hover:bg-gray-50 transition-colors">
						<CardHeader>
							<CardTitle>Membership Information</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-lg">
								Established Date:{" "}
								{new Date(
									playerData.establishedDate
								).toLocaleDateString("en-US", {
									timeZone: "UTC",
								})}
							</p>
							<p className="text-lg">
								Bad Standing:{" "}
								{playerData.badStanding ? "Yes" : "No"}
							</p>
							{playerData.badStanding && (
								<p className="text-lg">
									Bad Standing Reason:{" "}
									{playerData.badStandingReason}
								</p>
							)}
							<p className="text-lg">
								Take Off Mailing:{" "}
								{playerData.takeOffMailing ? "Yes" : "No"}
							</p>
							<p className="text-lg">
								Mail Standings:{" "}
								{playerData.mailStandings ? "Yes" : "No"}
							</p>
							<p className="text-lg">
								Form On File:{" "}
								{playerData.formOnFile ? "Yes" : "No"}
							</p>
							<p className="text-lg">
								Needs Member Card:{" "}
								{playerData.needsMemberCard ? "Yes" : "No"}
							</p>
							<p className="text-lg">
								Inactive Date:{" "}
								{playerData.inactiveDate
									? new Date(
											playerData.inactiveDate
									  ).toLocaleDateString("en-US", {
											timeZone: "UTC",
									  })
									: "N/A"}
							</p>
							<p className="text-lg">
								Last Membership Fee Payment:{" "}
								{playerData.lastMembershipFeePayment}
							</p>
							<p className="text-lg">
								Last Trails Date:{" "}
								{playerData.lastTrailsDate
									? new Date(
											playerData.lastTrailsDate
									  ).toLocaleDateString("en-US", {
											timeZone: "UTC",
									  })
									: "N/A"}
							</p>
							<p className="text-lg">
								Member Type: {playerData.memberType}
							</p>
							<p className="text-lg">
								Cannot Be Captain:{" "}
								{playerData.cannotBeCaptain ? "Yes" : "No"}
							</p>
							<p className="text-lg">
								Lifetime Member:{" "}
								{playerData.lifetimeMember ? "Yes" : "No"}
							</p>
							{playerData.lifetimeMember && (
								<p className="text-lg">
									Lifetime Member Reason:{" "}
									{playerData.lifetimeMemberReason}
								</p>
							)}
						</CardContent>
					</Card>
				</div>
				<div className="mt-6">
					<Button className="hover:bg-gray-100 border-gray-300 text-gray-700" asChild>
						<Link
							href="/Portal/Management/Players"
							prefetch={true}
						>
							Go Back
						</Link>
					</Button>
				</div>
			</div>

			<Dialog open={isMentionsHistoryDialogOpen} onOpenChange={setIsMentionsHistoryDialogOpen}>
				<DialogContent className="min-w-fit bg-white max-h-[90vh] overflow-y-auto">
					<PlayerMentionsHistoryContent playerData={playerData} />
				</DialogContent>
			</Dialog>
			
			<Dialog open={isTrailsHistoryDialogOpen} onOpenChange={setIsTrailsHistoryDialogOpen}>
				<DialogContent className="min-w-fit bg-white max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Trails History</DialogTitle>
					</DialogHeader>
					<PlayerTrailsHistoryContent playerData={playerData} />
					<div className="flex justify-center">
						<Button
							className="hover:bg-gray-100 border-gray-300 text-gray-700"
							asChild
						>
							<Link href={"/Portal/Activities/Trails"} prefetch={true}>
								Manage Trails Data
							</Link>
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="w-fit bg-white">
					<DialogHeader>
						<DialogTitle>Edit Player: {playerData.fullName}</DialogTitle>
					</DialogHeader>
					<PlayerEditForm
						rowData={playerData}
						handleEdit={handleEdit}
						onRefresh={handleRefresh}
						onClose={handleEdit}
					/>
				</DialogContent>
			</Dialog>

			<Dialog open={isTDPHistoryDialogOpen} onOpenChange={setIsTDPHistoryDialogOpen}>
				<DialogContent className="min-w-fit bg-white max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Top Darter Points History for {playerData.fullName}</DialogTitle>
					</DialogHeader>
					<PlayerTDPHistoryContent playerData={playerData} />
				</DialogContent>
			</Dialog>
		</div>
	);
}
