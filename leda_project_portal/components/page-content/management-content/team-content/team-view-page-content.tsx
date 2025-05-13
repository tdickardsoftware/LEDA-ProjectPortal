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
import { useState, useCallback } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RosterSeasonCodeSelector from "@/components/ui/roster-season-code-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TeamPaymentHistoryContent from "./team-payment-history-content";
import TeamPenaltyHistory from "./team-penalty-history";
import TeamLeagueHistory from "./team-league-history";

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
	// Payment status dialog state
	const [showPaymentPopover, setShowPaymentPopover] = useState(false);
	const [paymentSeasonCode, setPaymentSeasonCode] = useState<string>("");
	const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
	const [paymentStatusData, setPaymentStatusData] = useState<{ ledaId: string, status: 'PAID' | 'PART' | 'UNPAID' }[]>([]);
	const [filterCurrentSeason, setFilterCurrentSeason] = useState(true);
	const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
	const [isTeamPenaltyHistoryDialogOpen, setIsTeamHistoryDialogOpen] = useState(false);
	const [isTeamLeagueHistoryDialogOpen, setIsTeamLeagueHistoryDialogOpen] = useState(false);

	const handleEdit = () => {
		setIsEditDialogOpen(!isEditDialogOpen);
	};

	const handleRefresh = () => {
		window.location.reload();
	};

	const handlePaymentHistory = () => {
		setIsPaymentHistoryDialogOpen(!isPaymentHistoryDialogOpen);
	};

	const handlePenaltyHistory = () => {
		setIsTeamHistoryDialogOpen(!isTeamPenaltyHistoryDialogOpen);
	};

	const handleLeagueHistory = () => {
		setIsTeamLeagueHistoryDialogOpen(!isTeamLeagueHistoryDialogOpen);
	};

	// Fetch payment status for team members for the selected season
	const fetchPaymentStatus = useCallback(async (seasonCode: string) => {
		if (!seasonCode) return;
		setPaymentStatusLoading(true);
		try {
			const res = await fetch(`${teamPaymentHistoryRoute}/viewData?seasonCode=${seasonCode}&teamId=${teamData.ledaId}`);
			const data = await res.json();
			setPaymentStatusData(Array.isArray(data) ? data : []);
		} catch (e) {
			console.error("Failed to fetch payment status", e);
			setPaymentStatusData([]);
		} finally {
			setPaymentStatusLoading(false);
		}
	}, [teamData.ledaId]);

	const handleShowPaymentStatus = async () => {
		if (!paymentSeasonCode) return;
		await fetchPaymentStatus(paymentSeasonCode);
	};

	// Helper to get payment status for a member
	const getPaymentStatus = useCallback((ledaId: string) => {
		const paymentRecord = paymentStatusData.find(p => String(p.ledaId) === String(ledaId));
		return paymentRecord?.status || null;
	}, [paymentStatusData]);

	// Helper to render payment status icon with tooltip
	const renderPaymentStatusIcon = useCallback((ledaId: string) => {
		const status = getPaymentStatus(ledaId);
		if (!status) return null;
		let icon = null;
		let tooltipText = "";
		switch (status) {
			case 'PAID':
				icon = <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />;
				tooltipText = "Paid";
				break;
			case 'PART':
				icon = <AlertTriangle className="h-5 w-5 text-amber-500 ml-2" />;
				tooltipText = "Partial";
				break;
			case 'UNPAID':
				icon = <XCircle className="h-5 w-5 text-red-500 ml-2" />;
				tooltipText = "Unpaid";
				break;
			default:
				return null;
		}
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<span>{icon}</span>
					</TooltipTrigger>
					<TooltipContent className="bg-white rounded-lg">
						{tooltipText}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}, [getPaymentStatus]);

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
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
								onClick={handlePaymentHistory}
							>
								Payment History
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
								onClick={handlePenaltyHistory}
							>
								Penalty History
							</Button>
							<Button
								className="hover:bg-gray-100 border-gray-400 text-gray-700"
								onClick={handleLeagueHistory}
							>
								League History
							</Button>
							{/* Show Payment Status Popover */}
							<Popover open={showPaymentPopover} onOpenChange={setShowPaymentPopover}>
								<PopoverTrigger asChild>
									<Button
										className="hover:bg-gray-100 border-gray-400 text-gray-700"
										onClick={() => setShowPaymentPopover(true)}
									>
										Show Payment Status
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[350px] bg-white shadow-md rounded-lg border border-gray-200 p-4">
									<div className="flex flex-col gap-4">
										<RosterSeasonCodeSelector
											disabled={filterCurrentSeason}
											handleSelect={setPaymentSeasonCode}
											useCurrentSeason={filterCurrentSeason}
											seasonCode={paymentSeasonCode}
										/>
										<div className="flex items-center gap-2">
											<Checkbox
												checked={filterCurrentSeason}
												onCheckedChange={() => setFilterCurrentSeason(!filterCurrentSeason)}
											/>
											<span className="text-gray-700 text-sm">Current Season?</span>
										</div>
										<Button
											onClick={handleShowPaymentStatus}
											disabled={!paymentSeasonCode || paymentStatusLoading}
											className="w-full"
										>
											{paymentStatusLoading ? "Loading..." : "Show Payment Status"}
										</Button>
									</div>
								</PopoverContent>
							</Popover>
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
											{/* New column for Payment Status */}
											<TableHead className="px-4 py-2 text-center">Payment Status</TableHead>
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
												{/* Payment Status Icon */}
												<TableCell className="px-4 py-2 text-center flex items-center justify-center">
													{renderPaymentStatusIcon(member.ledaId)}
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

			<Dialog open={isPaymentHistoryDialogOpen} onOpenChange={setIsPaymentHistoryDialogOpen}>
				<DialogContent className="min-w-fit bg-white max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Payment History for {teamData.teamName}</DialogTitle>
					</DialogHeader>
					<TeamPaymentHistoryContent teamData={teamData} />
				</DialogContent>
			</Dialog>

			<Dialog open={isTeamPenaltyHistoryDialogOpen} onOpenChange={setIsTeamHistoryDialogOpen}>
				<DialogContent className="min-w-fit bg-white max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Penalty History for {teamData.teamName}</DialogTitle>
					</DialogHeader>
					<TeamPenaltyHistory ledaId={teamData.ledaId} />
				</DialogContent>
			</Dialog>
			<Dialog open={isTeamLeagueHistoryDialogOpen} onOpenChange={setIsTeamLeagueHistoryDialogOpen}>
				<DialogContent className="min-w-fit bg-white max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>League History for {teamData.teamName}</DialogTitle>
					</DialogHeader>
					<TeamLeagueHistory ledaId={teamData.ledaId} />
				</DialogContent>
			</Dialog>
		</div>
	);
}
