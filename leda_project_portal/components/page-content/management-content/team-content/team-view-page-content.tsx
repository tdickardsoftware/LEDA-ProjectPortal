"use client";

/**
 * TeamPageContent
 *
 * Detail view for a single team record. Displays team metadata and its
 * associated place in read-only cards.
 *
 * Toolbar actions (via `FolderTabMed`):
 *   - Edit Team — opens `TeamEditForm` in a dialog.
 *   - Payment History / Add Team Payment — opens payment dialogs.
 *   - League History — opens `TeamLeagueHistory`.
 *   - Penalty History — opens `TeamPenaltyHistory`.
 *
 * `renderPaymentStatusIcon` fetches each roster member's payment status
 * and renders a colour-coded icon (PAID / PART-PAID / UNPAID) with a
 * tooltip inside a popover.
 */

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
import { teamPaymentHistoryRoute, playerPaymentHistoryRoute } from "@/lib/apiRoutes";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import RosterSeasonCodeSelector from "@/components/ui/roster-season-code-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import TeamPaymentHistoryContent from "./team-payment-history-content";
import TeamPenaltyHistory from "./team-penalty-history";
import TeamLeagueHistory from "./team-league-history";
import { useQuery } from "@tanstack/react-query";

export default function TeamPageContent({
	teamData,
	memberDetails,
	backHref = "/Portal/Management/Teams",
}: {
	teamData: Team;
	memberDetails: {
		fullName: string;
		ledaId: string;
		isCaptain: boolean;
		cannotBeCaptain: boolean;
		badStanding: boolean;
	}[];
	backHref?: string;
}) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [showPaymentPopover, setShowPaymentPopover] = useState(false);
	const [paymentSeasonCode, setPaymentSeasonCode] = useState<string>("");
	const [filterCurrentSeason, setFilterCurrentSeason] = useState(true);
	const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] =
		useState(false);
	const [isTeamPenaltyHistoryDialogOpen, setIsTeamHistoryDialogOpen] =
		useState(false);
	const [isTeamLeagueHistoryDialogOpen, setIsTeamLeagueHistoryDialogOpen] =
		useState(false);

	// --- TanStack Query: Fetch payment status for team members for the selected season ---
	const {
		data: paymentStatusData = [],
		isFetching: paymentStatusLoading,
		error: paymentStatusError,
		refetch: refetchPaymentStatus,
	} = useQuery<{
		ledaId: string;
		status: "PAID" | "PART" | "UNPAID" | null;
	}[]>({
		queryKey: [
			"teamMemberPaymentStatus",
			paymentSeasonCode,
			memberDetails.map((m) => m.ledaId).join(","),
		],
		enabled: !!paymentSeasonCode && memberDetails.length > 0 && showPaymentPopover,
		queryFn: async () => {
			// Use sequential fetching instead of Promise.all to prevent overwhelming the server
			const results = [];
			for (const member of memberDetails) {
				try {
					const res = await fetch(
						`${playerPaymentHistoryRoute}/viewData?seasonCode=${paymentSeasonCode}&ledaId=${member.ledaId}`
					);
					
					if (!res.ok) {
						console.error(`Error fetching payment status for ledaId ${member.ledaId}: ${res.status}`);
						// Add a record with null status rather than failing the whole query
						results.push({
							ledaId: member.ledaId,
							status: null
						});
						continue;
					}
					
					const data = await res.json();
					results.push({
						ledaId: member.ledaId,
						status: data?.status || null,
					});
				} catch (err) {
					console.error(`Error processing payment status for ledaId ${member.ledaId}:`, err);
					// Still add a record with null status
					results.push({
						ledaId: member.ledaId,
						status: null
					});
				}
			}
			return results;
		},
		retry: 1, // Only retry once to avoid hammering the server
		retryDelay: 1000, // Wait 1 second between retries
	});

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

	const handleShowPaymentStatus = async () => {
		if (!paymentSeasonCode) return;
		await refetchPaymentStatus();
	};

	const getPaymentStatus = (ledaId: string) => {
		const paymentRecord = paymentStatusData.find(
			(p) => String(p.ledaId) === String(ledaId)
		);
		return paymentRecord?.status || null;
	};

	const renderPaymentStatusIcon = (ledaId: string) => {
		const status = getPaymentStatus(ledaId);
		if (!status) return null;
		let icon = null;
		let tooltipText = "";
		switch (status) {
			case "PAID":
				icon = (
					<CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
				);
				tooltipText = "Paid";
				break;
			case "PART":
				icon = (
					<AlertTriangle className="h-5 w-5 text-amber-500 ml-2" />
				);
				tooltipText = "Partial";
				break;
			case "UNPAID":
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
					<TooltipContent className="bg-background text-foreground rounded-lg">
						{tooltipText}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
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
							<Button variant="outline"
								onClick={handleEdit}
								className="hover:bg-muted border-border text-foreground"
							>
								Edit Team
							</Button>
							<PaymentHistoryFormDialog
								buttonText="Add Team Payment"
								initialLedaId={teamData.ledaId.toString()}
								route={teamPaymentHistoryRoute}
								type="team"
							/>
							<Button variant="outline"
								className="hover:bg-muted border-border text-foreground"
								onClick={handlePaymentHistory}
							>
								Payment History
							</Button>
							<Button variant="outline"
								className="hover:bg-muted border-border text-foreground"
								onClick={handlePenaltyHistory}
							>
								Penalty History
							</Button>
							<Button variant="outline"
								className="hover:bg-muted border-border text-foreground"
								onClick={handleLeagueHistory}
							>
								League History
							</Button>
							{/* Show Payment Status Popover */}
							<Popover
								open={showPaymentPopover}
								onOpenChange={setShowPaymentPopover}
							>
								<PopoverTrigger asChild>
									<Button variant="outline"
										className="hover:bg-muted border-border text-foreground"
										onClick={() =>
											setShowPaymentPopover(true)
										}
									>
										Show Payment Status
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[350px] bg-background shadow-md rounded-lg border border-border p-4">
									<div className="flex flex-col gap-4">
										<RosterSeasonCodeSelector
											disabled={filterCurrentSeason}
											handleSelect={setPaymentSeasonCode}
											useCurrentSeason={
												filterCurrentSeason
											}
											seasonCode={paymentSeasonCode}
										/>
										<div className="flex items-center gap-2">
											<Checkbox
												checked={filterCurrentSeason}
												onCheckedChange={() =>
													setFilterCurrentSeason(
														!filterCurrentSeason
													)
												}
											/>
											<span className="text-foreground text-sm">
												Current Season?
											</span>
										</div>
										{paymentStatusError && (
											<div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
												Error loading payment statuses. Please try again.
											</div>
										)}
										<Button
											onClick={handleShowPaymentStatus}
											disabled={
												!paymentSeasonCode ||
												paymentStatusLoading
											}
											className="w-full"
										>
											{paymentStatusLoading
												? "Loading..."
												: "Show Payment Status"}
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</FolderTabMed>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="shadow-md border border-border hover:bg-muted transition-colors">
						<CardHeader>
							<CardTitle>Team Information</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-lg">
								Established Date:{" "}
								{new Date(
									teamData.establishedDate
								).toLocaleDateString("en-US", {
									timeZone: "UTC",
								})}
							</p>
							<p className="text-lg">
								Last Team Fee Payment:{" "}
								{teamData.lastTeamFeePayment}
							</p>
							{teamData.memo && (
								<p className="text-lg">Memo: {teamData.memo}</p>
							)}
						</CardContent>
					</Card>
					<Card className="shadow-md border border-border hover:bg-muted transition-colors">
						<CardHeader>
							<CardTitle>Team Member Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="px-4 py-2 text-left">
												Full Name
											</TableHead>
											<TableHead className="px-4 py-2 text-left">
												LEDA ID
											</TableHead>
											<TableHead className="px-4 py-2 text-center">
												Captain
											</TableHead>
											<TableHead className="px-4 py-2 text-center">
												Can&apos;t Be Captain
											</TableHead>
											<TableHead className="px-4 py-2 text-center">
												Bad Standing
											</TableHead>
											{/* New column for Payment Status */}
											<TableHead className="px-4 py-2 text-center">
												Payment Status
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{memberDetails.map((member) => (
											<TableRow key={member.ledaId}>
												<TableCell className="px-4 py-2">
													{member.fullName}
												</TableCell>
												<TableCell className="px-4 py-2">
													{member.ledaId}
												</TableCell>
												<TableCell className="px-4 py-2 text-center">
													{member.isCaptain ? (
														<Star className="h-4 w-4 text-yellow-500 inline" />
													) : (
														<span className="text-muted-foreground">
															—
														</span>
													)}
												</TableCell>
												<TableCell className="px-4 py-2 text-center">
													{member.cannotBeCaptain ? (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
															Yes
														</span>
													) : (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
															No
														</span>
													)}
												</TableCell>
												<TableCell className="px-4 py-2 text-center">
													{member.badStanding ? (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
															Yes
														</span>
													) : (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
															No
														</span>
													)}
												</TableCell>
												{/* Payment Status Icon */}
												<TableCell className="px-4 py-2 text-center flex items-center justify-center">
													{renderPaymentStatusIcon(
														member.ledaId
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
					<Button variant="outline"
						className="hover:bg-muted border-border text-foreground"
						asChild
					>
						<Link href={backHref} prefetch={true}>
							Go Back
						</Link>
					</Button>
				</div>
			</div>
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="w-fit bg-background">
					<DialogHeader>
						<DialogTitle>
							Edit Team: {teamData.teamName}
						</DialogTitle>
					</DialogHeader>
					<TeamEditForm
						rowData={teamData}
						onRefresh={handleRefresh}
						onClose={handleEdit}
						handleRefresh={handleRefresh}
					/>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isPaymentHistoryDialogOpen}
				onOpenChange={setIsPaymentHistoryDialogOpen}
			>
				<DialogContent className="min-w-fit bg-background max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Payment History for {teamData.teamName}
						</DialogTitle>
					</DialogHeader>
					<TeamPaymentHistoryContent teamData={teamData} />
				</DialogContent>
			</Dialog>

			<Dialog
				open={isTeamPenaltyHistoryDialogOpen}
				onOpenChange={setIsTeamHistoryDialogOpen}
			>
				<DialogContent className="min-w-fit bg-background max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Penalty History for {teamData.teamName}
						</DialogTitle>
					</DialogHeader>
					<TeamPenaltyHistory ledaId={teamData.ledaId} />
				</DialogContent>
			</Dialog>
			<Dialog
				open={isTeamLeagueHistoryDialogOpen}
				onOpenChange={setIsTeamLeagueHistoryDialogOpen}
			>
				<DialogContent className="min-w-fit bg-background max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							League History for {teamData.teamName}
						</DialogTitle>
					</DialogHeader>
					<TeamLeagueHistory ledaId={teamData.ledaId} />
				</DialogContent>
			</Dialog>
		</div>
	);
}
							