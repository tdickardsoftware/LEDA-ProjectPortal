"use client";

import React, { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PaymentHistory } from "@/lib/definitions";
import {
	playerPaymentHistoryRoute,
	teamPaymentHistoryRoute,
	placePaymentHistoryRoute,
} from "@/lib/apiRoutes";
import { Button } from "./ui/button";
import { ServerSideDataTable } from "./server-side-datatable";
import { ColumnDef } from "@tanstack/react-table";
import PaymentHistoryFormDialog from "./payment-history-form-dialog";
import { Eye, PencilIcon, XIcon } from "lucide-react";
import { fetchWithSession } from "@/lib/getData";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { usePlayerPaymentsData, PlayerPaymentHistoryDataTable } from "@/hooks/usePlayerPaymentsData";
import { useTeamPaymentsData, TeamPaymentHistoryDataTable } from "@/hooks/useTeamPaymentsData";
import { usePlacePaymentsData, PlacePaymentHistoryDataTable } from "@/hooks/usePlacePaymentsData";
import { usePersistedDataTableState } from "@/hooks/usePersistedDataTableState";

type PaymentDataType = PlayerPaymentHistoryDataTable | TeamPaymentHistoryDataTable | PlacePaymentHistoryDataTable;

interface PaymentVisualisorProps {
	type: "player" | "team" | "place";
	ledaId?: string;
}

export function PaymentVisualisor({ type, ledaId }: PaymentVisualisorProps) {
	const [selectedPayment, setSelectedPayment] = useState<PaymentDataType | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const { page: currentPage, setPage: setCurrentPage, search, setSearch } =
		usePersistedDataTableState(`datatable:/Payments/${type}/${ledaId ?? "all"}`);
	const pageSize = 10;
	const queryClient = useQueryClient();

	// Get the appropriate route for the payment type - wrapped in useCallback
	const getBaseRoute = React.useCallback(() => {
		if (type === "player") return playerPaymentHistoryRoute;
		if (type === "team") return teamPaymentHistoryRoute;
		if (type === "place") return placePaymentHistoryRoute;
		return "";
	}, [type]);

	// Helper function to format dates consistently
	const formatDate = React.useCallback((dateStr: string | Date | undefined) => {
		if (!dateStr) return "N/A";
		
		const date = typeof dateStr === "string" 
			? new Date(dateStr + (dateStr.endsWith("Z") ? "" : "T00:00:00Z"))
			: dateStr;
			
		return date.toLocaleDateString("en-US", { timeZone: "UTC" });
	}, []);

	// Use appropriate hook based on type
	const playerQuery = usePlayerPaymentsData(currentPage, pageSize, search, ledaId);
	const teamQuery = useTeamPaymentsData(currentPage, pageSize, search, ledaId);
	const placeQuery = usePlacePaymentsData(currentPage, pageSize, search, ledaId);

	// Select the appropriate query result based on type
	const currentQuery = type === "player" ? playerQuery : type === "team" ? teamQuery : placeQuery;
	const { data: queryData, isLoading: paymentsLoading, error: paymentsError } = currentQuery;

	const payments = queryData?.data || [];
	const totalPages = queryData?.pagination?.totalPages || 1;

	const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

	const refreshPayments = React.useCallback(() => {
		currentQuery.refetch();
		queryClient.invalidateQueries({ queryKey: [type === "player" ? "player-payments-datatable" : type === "team" ? "team-payments-datatable" : "place-payments-datatable"] });
	}, [currentQuery, queryClient, type]);

	// Helper to convert PaymentDataType to PaymentHistory for form compatibility
	const toPaymentHistory = React.useCallback((payment: PaymentDataType): PaymentHistory => {
		return {
			...payment,
			date: new Date(payment.date),
		};
	}, []);

	// Function to delete a payment record - wrapped in useCallback
	const handleDeletePayment = React.useCallback(async (payment: PaymentDataType) => {
		if (!window.confirm("Are you sure you want to delete this payment record? This action cannot be undone.")) {
			return;
		}

		try {
			const baseRoute = getBaseRoute();
			if (!baseRoute) return;

			// Convert string date to Date for API compatibility
			const paymentForApi = {
				...payment,
				date: new Date(payment.date)
			};

			const response = await fetchWithSession(`${baseRoute}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(paymentForApi),
			});
			
			if (!response.ok) {
				throw new Error(`Failed to delete payment: ${response.statusText}`);
			}
			
			refreshPayments();
		} catch (error) {
			console.error("Error deleting payment:", error);
			alert("Failed to delete payment. Please try again.");
		}
	}, [getBaseRoute, refreshPayments]);
	
	// Show payment details in dialog - wrapped in useCallback
	const showPaymentDetails = React.useCallback((payment: PaymentDataType) => {
		setSelectedPayment(payment);
		setDetailsOpen(true);
	}, []);
	
	// Define columns for the DataTable
	const columns = useMemo<ColumnDef<PaymentDataType>[]>(() => [
		{
			accessorKey: "paymentNbr",
			header: "Payment #",
			enableColumnFilter: false,
		},
		{
			accessorKey: "ledaId",
			header: "LEDA ID",
		},
		{
			accessorKey: "fullName",
			header: "Name",
			cell: ({ row }) => row.original.fullName || "N/A",
		},
		{
			accessorKey: "amount",
			header: "Amount",
		},
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => formatDate(row.original.date),
		},
		{
			accessorKey: "type",
			header: "Type",
		},
		{
			accessorKey: "seasonCode",
			header: "Season",
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex gap-2 justify-left">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => showPaymentDetails(row.original)}
						className="p-1 h-8 w-8"
					>
						<Eye className="h-4 w-4" />
					</Button>
					<PaymentHistoryFormDialog
						buttonText=""
						buttonIcon={<PencilIcon className="h-4 w-4" />}
						onSuccess={refreshPayments}
						initialLedaId={ledaId}
						route={getBaseRoute()}
						paymentData={toPaymentHistory(row.original)}
						isEditing={true}
						type={type}
					/>
					<Button
						variant="ghost"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							handleDeletePayment(row.original);
						}}
						className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 h-8 w-8"
					>
						<XIcon className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	], [ledaId, type, showPaymentDetails, refreshPayments, getBaseRoute, handleDeletePayment, formatDate, toPaymentHistory]);

	return (
		<div className="w-full">
			<div className="flex justify-between items-center mb-4">
				<PaymentHistoryFormDialog
					buttonText={`Add ${capitalizedType} Payment`}
					onSuccess={refreshPayments}
					initialLedaId={ledaId}
					route={getBaseRoute()}
					type={type}
				/>
			</div>
			
			{paymentsLoading ? (
				<div className="flex justify-center items-center h-40">
					<p>Loading payments...</p>
				</div>
			) : paymentsError ? (
				<div className="flex justify-center items-center h-40 text-red-500">
					<p>
						{paymentsError instanceof Error 
							? paymentsError.message 
							: String(paymentsError)}
					</p>
				</div>
			) : (
				<>
					<ServerSideDataTable 
						columns={columns}
						data={payments}
						pageName={`${capitalizedType} Payments`}
						stateKey={`datatable:/Payments/${type}/${ledaId ?? "all"}`}
						queryKey={[
							type === "player"
								? "player-payments-datatable"
								: type === "team"
									? "team-payments-datatable"
									: "place-payments-datatable",
						]}
						defaultSort="paymentNbr"
						isLoading={paymentsLoading}
						totalPages={totalPages}
						currentPage={currentPage}
						onPageChange={setCurrentPage}
						onSearchChange={setSearch}
						searchValue={search}
					/>
					
					{/* Payment Details Dialog */}
					<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
						<DialogContent className="max-w-2xl bg-background">
							<DialogHeader>
								<DialogTitle>Payment Details</DialogTitle>
								<DialogDescription>
									Payment #{selectedPayment?.paymentNbr} for {selectedPayment?.fullName || "N/A"}
								</DialogDescription>
							</DialogHeader>
							
							{selectedPayment && (
								<div className="grid grid-cols-2 gap-4 mt-4">
									<div>
										<p className="font-semibold">Payment #:</p>
										<p>{selectedPayment.paymentNbr}</p>
									</div>
									<div>
										<p className="font-semibold">LEDA ID:</p>
										<p>{selectedPayment.ledaId}</p>
									</div>
									<div>
										<p className="font-semibold">Name:</p>
										<p>{selectedPayment.fullName || "N/A"}</p>
									</div>
									<div>
										<p className="font-semibold">Amount:</p>
										<p>{selectedPayment.amount}</p>
									</div>
									<div>
										<p className="font-semibold">Date:</p>
										<p>{formatDate(selectedPayment.date)}</p>
									</div>
									<div>
										<p className="font-semibold">Type:</p>
										<p>{selectedPayment.type}</p>
									</div>
									<div>
										<p className="font-semibold">Payment Type:</p>
										<p>{selectedPayment.paymentType}</p>
									</div>
									<div>
										<p className="font-semibold">Season Code:</p>
										<p>{selectedPayment.seasonCode}</p>
									</div>
									<div>
										<p className="font-semibold">Fiscal Year:</p>
										<p>{selectedPayment.fiscalYear}</p>
									</div>
									<div>
										<p className="font-semibold">Comp:</p>
										<p>{selectedPayment.comp ? "Yes" : "No"}</p>
									</div>
									<div>
										<p className="font-semibold">Paid Off:</p>
										<p>{selectedPayment.paidOff ? "Yes" : "No"}</p>
									</div>
									{selectedPayment.notes && (
										<div className="col-span-2">
											<p className="font-semibold">Notes:</p>
											<p>{selectedPayment.notes}</p>
										</div>
									)}
									
									<div className="col-span-2 flex justify-end gap-2 mt-4">
										<PaymentHistoryFormDialog
											buttonText="Edit"
											buttonIcon={<PencilIcon className="h-4 w-4 mr-2" />}
											onSuccess={() => {
												refreshPayments();
												setDetailsOpen(false);
											}}
											initialLedaId={ledaId}
											route={getBaseRoute()}
											paymentData={toPaymentHistory(selectedPayment)}
											isEditing={true}
											type={type}
										/>
										<Button
											variant="outline"
											onClick={(e) => {
												e.stopPropagation();
												handleDeletePayment(selectedPayment);
												setDetailsOpen(false);
											}}
											className="text-red-600 hover:text-red-800 hover:bg-red-100"
										>
											<XIcon className="h-4 w-4 mr-2" /> Delete
										</Button>
									</div>
								</div>
							)}
						</DialogContent>
					</Dialog>
				</>
			)}
		</div>
	);
}

