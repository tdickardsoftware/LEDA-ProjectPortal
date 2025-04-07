"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { toast } from "sonner";
import { X, Pencil } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import AdjustmentForm from "./adjustment-form"; // Import the adjustment form
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type AdjustmentItem = {
	global: boolean;
	adjustmentAmount: number;
	credit: boolean;
	notes: string;
};

type GlobalAdjustmentMap = {
	[adjustmentId: string]: {
		adjustment: AdjustmentItem;
		appliedTeamsCount: number;
	};
};

type Team = {
	adjustments?: {
		[adjustmentId: string]: AdjustmentItem;
	};
	// Other team properties would go here
};

type Subdivision = {
	[teamId: string]: Team;
};

type Division = {
	[subdivision: string]: Subdivision;
};

type PayoutsData = {
	[division: string]: Division;
};

interface ManageGlobalAdjustmentsProps {
	payoutsData: PayoutsData;
	onRemoveGlobalAdjustment: (adjustmentId: string) => void;
	highlightedAdjustmentId?: string | null;
}

export default function ManageGlobalAdjustments({
	payoutsData,
	onRemoveGlobalAdjustment,
	highlightedAdjustmentId,
}: ManageGlobalAdjustmentsProps) {
	const [globalAdjustments, setGlobalAdjustments] =
		React.useState<GlobalAdjustmentMap>({});
	const [selectedAdjustmentId, setSelectedAdjustmentId] = React.useState<
		string | null
	>(null);
	const [editDialogOpen, setEditDialogOpen] = React.useState(false); // State for edit dialog
	const [editingAdjustment, setEditingAdjustment] =
		React.useState<AdjustmentItem | null>(null);

	// Extract global adjustments from payouts data
	React.useEffect(() => {
		const extractedAdjustments: GlobalAdjustmentMap = {};

		// Iterate through all teams' adjustments to find global ones
		Object.keys(payoutsData).forEach((division) => {
			Object.keys(payoutsData[division]).forEach((subdivision) => {
				Object.keys(payoutsData[division][subdivision]).forEach(
					(teamId) => {
						const teamAdjustments =
							payoutsData[division][subdivision][teamId]
								.adjustments;

						if (teamAdjustments) {
							Object.entries(teamAdjustments).forEach(
								([adjustmentId, adjustment]) => {
									// Only process global adjustments
									if (adjustment.global) {
										// If this global adjustment hasn't been seen yet, initialize it
										if (
											!extractedAdjustments[adjustmentId]
										) {
											extractedAdjustments[adjustmentId] =
												{
													adjustment: adjustment,
													appliedTeamsCount: 0,
												};
										}

										// Increment the count of teams this adjustment applies to
										extractedAdjustments[adjustmentId]
											.appliedTeamsCount++;
									}
								}
							);
						}
					}
				);
			});
		});

		setGlobalAdjustments(extractedAdjustments);
	}, [payoutsData]);

	// Handle deletion confirmation with window.confirm
	const confirmDelete = (adjustmentId: string) => {
		if (
			window.confirm(
				"This will remove the adjustment from all teams. This action cannot be undone."
			)
		) {
			// Don't set state and then use it immediately - directly call the removal function
			onRemoveGlobalAdjustment(adjustmentId);
			toast.success("Global adjustment removed successfully");
		}
	};

	// Handle edit button click
	const handleEdit = (adjustmentId: string) => {
		const adjustment = globalAdjustments[adjustmentId]?.adjustment;
		if (adjustment) {
			setEditingAdjustment(adjustment);
			setSelectedAdjustmentId(adjustmentId);
			setEditDialogOpen(true);
		}
	};

	// Handle adjustment update
	const handleAdjustmentUpdate = (
		adjustmentId: string,
		updatedAdjustment: AdjustmentItem
	) => {
		const updatedGlobalAdjustments = { ...globalAdjustments };

		// Ensure amount has exactly two decimal places
		const formattedAmount = Number(
			Math.abs(updatedAdjustment.adjustmentAmount).toFixed(2)
		);
		updatedAdjustment.adjustmentAmount = updatedAdjustment.credit
			? formattedAmount
			: -formattedAmount;

		if (updatedGlobalAdjustments[adjustmentId]) {
			updatedGlobalAdjustments[adjustmentId].adjustment =
				updatedAdjustment;
		}
		setGlobalAdjustments(updatedGlobalAdjustments);

		// Update all teams with the new adjustment
		Object.keys(payoutsData).forEach((division) => {
			Object.keys(payoutsData[division]).forEach((subdivision) => {
				Object.keys(payoutsData[division][subdivision]).forEach(
					(teamId) => {
						const teamAdjustments =
							payoutsData[division][subdivision][teamId]
								.adjustments;
						if (teamAdjustments && teamAdjustments[adjustmentId]) {
							teamAdjustments[adjustmentId] = updatedAdjustment;
						}
					}
				);
			});
		});

		toast.success("Global adjustment updated successfully");
		setEditDialogOpen(false);
	};

	return (
		<div className="w-full space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Amount</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Notes</TableHead>
							<TableHead>Applied to</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Object.keys(globalAdjustments).length > 0 ? (
							Object.entries(globalAdjustments).map(
								([
									adjustmentId,
									{ adjustment, appliedTeamsCount },
								]) => (
									<TableRow
										key={adjustmentId}
										className={
											highlightedAdjustmentId ===
											adjustmentId
												? "bg-yellow-100"
												: ""
										}
									>
										<TableCell className="font-medium">
											$
											{Math.abs(
												adjustment.adjustmentAmount
											).toFixed(2)}
										</TableCell>
										<TableCell>
											<span
												className={
													adjustment.credit
														? "text-green-600"
														: "text-red-600"
												}
											>
												{adjustment.credit
													? "Credit"
													: "Debit"}
											</span>
										</TableCell>
										<TableCell>
											{adjustment.notes}
										</TableCell>
										<TableCell>
											{appliedTeamsCount} teams
										</TableCell>
										<TableCell className="flex space-x-2">
											<Button
												variant="ghost"
												size="sm"
												className="text-blue-600 hover:text-blue-700 hover:bg-transparent p-1 h-auto"
												onClick={() =>
													handleEdit(adjustmentId)
												}
											>
												<Pencil size={18} />
											</Button>
											<span
												className="text-red-600 hover:text-red-700 hover:bg-transparent p-1 h-auto cursor-pointer"
												onClick={() =>
													confirmDelete(adjustmentId)
												}
											>
												<X size={18} />
											</span>
										</TableCell>
									</TableRow>
								)
							)
						) : (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-4 text-gray-500 italic"
								>
									No global adjustments found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Edit Adjustment Dialog */}
			{editingAdjustment && (
				<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
					<DialogContent
						className="bg-white relative max-w-lg mx-auto p-6 rounded-md shadow-lg"
						style={{
							position: "fixed",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
						}}
						onClick={(e) => e.stopPropagation()} // Prevent click propagation
						aria-describedby="edit-adjustment-description" // Add aria-describedby
					>
						<DialogHeader>
							<DialogTitle>Edit Global Adjustment</DialogTitle>
						</DialogHeader>
						<p
							id="edit-adjustment-description"
							className="text-sm text-gray-500"
						>
							Update the details of the global adjustment below.
						</p>
						<AdjustmentForm
							global={true}
							teamId={""}
							adjustmentData={{
								amount: editingAdjustment.adjustmentAmount || 0, // Ensure default value
								type: editingAdjustment.credit || false, // Ensure default value
								notes: editingAdjustment.notes || "", // Ensure default value
							}}
							handleAdjustment={(teamId, amount, type, notes) => {
								handleAdjustmentUpdate(selectedAdjustmentId!, {
									global: true,
									adjustmentAmount: amount,
									credit: type,
									notes: notes || "",
								});
							}}
							setOpen={setEditDialogOpen}
						/>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
