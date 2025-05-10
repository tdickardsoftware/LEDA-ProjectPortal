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
import { cn } from "@/lib/utils";
import { FolderTabMed } from "@/components/ui/folder-tab";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import PaymentHistoryFormDialog from "@/components/payment-history-form-dialog";
import { teamPaymentHistoryRoute } from "@/lib/apiRoutes";

export default function TeamPageContent({
	teamData,
	memberDetails,
}: {
	teamData: Team;
	memberDetails: {
		fullName: string | undefined;
		ledaId: string;
		isCaptain: boolean;
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
							{memberDetails.map((member) => (
								<p
									key={member.ledaId}
									className="text-lg flex items-center"
								>
									{member.fullName} (LEDA ID:{" "}
									{member.ledaId}){" "}
									{member.isCaptain && (
										<Star
											className={cn(
												"h-4 w-4 text-yellow-500 ml-1"
											)}
										/>
									)}
								</p>
							))}
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
