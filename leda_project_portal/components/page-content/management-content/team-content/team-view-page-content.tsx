"use client";

import { Team } from "@/lib/definitions";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components//ui/card";
import TeamEditForm from "@/components/forms/management/team-edit-form";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { FolderTabMed } from "@/components/ui/folder-tab";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import PaymentHistoryFormDialog from "@/components/payment-history-form-dialog";
import { teamPaymentHistoryRoute } from "@/lib/apiRoutes";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";

export default function TeamPageContent({
	teamData,
	memberDetails,
}: {
	teamData: Team;
	memberDetails: {
		fullName: string;
		ledaId: string;
		isCaptain: boolean;
		cannotBeCaptain: boolean;
		badStanding: boolean;
	}[];
}) {
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
					Team Name: {teamData.teamName}
				</h1>
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-semibold mb-6">
						LEDA ID #{teamData.ledaId}
					</h2>
				</div>
				<div className="flex justify-center pb-4">
					<FolderTabMed title="Team Actions">
						<div className="flex gap-2">
							<Button
								onClick={handleEdit}
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
							>
								Edit Team
							</Button>
							<PaymentHistoryFormDialog
								buttonText="Add Team Payment"
								initialLedaId={teamData.ledaId.toString()}
								route={teamPaymentHistoryRoute}
								type="team"
							/>
						</div>
					</FolderTabMed>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="shadow-md border border-gray-300 hover:bg-gray-50 transition-colors">
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
							<p className="text-lg">
								Last Team Fee Payment:{" "}
								{teamData.lastTeamFeePayment}
							</p>
							{teamData.memo && (
								<p className="text-lg">
									Memo: {teamData.memo}
								</p>
							)}
						</CardContent>
					</Card>
					<Card className="shadow-md border border-gray-300 hover:bg-gray-50 transition-colors">
						<CardHeader>
							<CardTitle>Team Member Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="px-4 py-2 text-left">Full Name</TableHead>
											<TableHead className="px-4 py-2 text-left">LEDA ID</TableHead>
											<TableHead className="px-4 py-2 text-center">Captain</TableHead>
											<TableHead className="px-4 py-2 text-center">Cannot Be Captain</TableHead>
											<TableHead className="px-4 py-2 text-center">Bad Standing</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{memberDetails.map((member) => (
											<TableRow key={member.ledaId}>
												<TableCell className="px-4 py-2">{member.fullName}</TableCell>
												<TableCell className="px-4 py-2">{member.ledaId}</TableCell>
												<TableCell className="px-4 py-2 text-center">
													{member.isCaptain ? (
														<Star className="h-4 w-4 text-yellow-500 inline" />
													) : (
														<span className="text-gray-400">—</span>
													)}
												</TableCell>
												<TableCell className="px-4 py-2 text-center">
													{member.cannotBeCaptain ? (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Yes</span>
													) : (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">No</span>
													)}
												</TableCell>
												<TableCell className="px-4 py-2 text-center">
													{member.badStanding ? (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Yes</span>
													) : (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">No</span>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="mt-6">
					<Button className="hover:bg-gray-100 border-gray-300 text-gray-700" asChild>
						<Link
							href="/Portal/Management/Teams"
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
						<DialogTitle>Edit Team: {teamData.teamName}</DialogTitle>
					</DialogHeader>
					<TeamEditForm
						rowData={teamData}
						onRefresh={handleRefresh}
						onClose={handleEdit}
						handleRefresh={handleRefresh}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
