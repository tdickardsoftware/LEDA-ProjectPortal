"use client";

import React, { useState, useEffect } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PaymentHistory } from "@/lib/definitions";
import {
	playerPaymentHistoryRoute,
	teamPaymentHistoryRoute,
	placePaymentHistoryRoute,
} from "@/lib/apiRoutes";
import { Button } from "./ui/button";
import PaymentHistoryFormDialog from "./payment-history-form-dialog";
import { PencilIcon, XIcon } from "lucide-react";
import PaymentTypeSelectorNF from "./ui/payment-type-selector-nf";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { FilterIcon } from "lucide-react";

interface PaymentVisualisorProps {
	type: "player" | "team" | "place";
	ledaId?: string;
}

interface PaymentDate {
	paymentDate: string;
}

export function PaymentVisualisor({ type, ledaId }: PaymentVisualisorProps) {
	const [payments, setPayments] = useState<PaymentHistory[]>([]);
	const [uniqueDates, setUniqueDates] = useState<PaymentDate[]>([]);
	const [selectedDate, setSelectedDate] = useState<string>("all");
	const [selectedPaymentType, setSelectedPaymentType] = useState<
		{ paymentType: string; desc: string } | undefined
	>(undefined);
	const [appliedPaymentType, setAppliedPaymentType] = useState<
		{ paymentType: string; desc: string } | undefined
	>(undefined);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filterOpen, setFilterOpen] = useState(false);

	// Capitalize first letter of type
	const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const recordsPerPage = 10;
	const indexOfLastRecord = currentPage * recordsPerPage;
	const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
	const currentRecords = payments.slice(
		indexOfFirstRecord,
		indexOfLastRecord
	);
	const totalPages = Math.ceil(payments.length / recordsPerPage);

	// Function to refresh payment data after a new payment is added
	const refreshPayments = () => {
		setLoading(true);
		// This will trigger the useEffect that fetches payments
		setSelectedDate(selectedDate);
	};

	// Function to clear all filters
	const clearFilters = () => {
		setSelectedDate("all");
		setSelectedPaymentType(undefined);
		setAppliedPaymentType(undefined);
		setFilterOpen(false);
	};

	// Function to apply the selected filter
	const applyFilter = () => {
		setAppliedPaymentType(selectedPaymentType);
		setFilterOpen(false);
	};

	// Fetch all unique payment dates
	useEffect(() => {
		async function fetchUniqueDates() {
			try {
				let baseRoute = "";
				if (type === "player") baseRoute = playerPaymentHistoryRoute;
				else if (type === "team") baseRoute = teamPaymentHistoryRoute;
				else if (type === "place") baseRoute = placePaymentHistoryRoute;
				else return setUniqueDates([]);

				const url = ledaId
					? `${baseRoute}/uniqueDates?ledaId=${ledaId}`
					: `${baseRoute}/uniqueDates`;
				const response = await fetch(url);

				if (!response.ok) return setUniqueDates([]);

				const data = await response.json();
				// Convert the field name from "date" to "paymentDate" to match the interface
				const dates = Array.isArray(data)
					? data.map((item) => ({ paymentDate: item.date }))
					: (data?.rows || []).map((item: { date: string }) => ({
							paymentDate: item.date,
					  }));
				setUniqueDates(dates);
			} catch {
				setUniqueDates([]);
			}
		}

		fetchUniqueDates();
	}, [type, ledaId]);

	// Fetch payment information
	useEffect(() => {
		const controller = new AbortController();
		let isMounted = true;

		async function fetchPayments() {
			setLoading(true);
			setError(null);

			try {
				let baseUrl = "";
				if (type === "player") baseUrl = playerPaymentHistoryRoute;
				else if (type === "team") baseUrl = teamPaymentHistoryRoute;
				else if (type === "place") baseUrl = placePaymentHistoryRoute;
				else {
					if (isMounted) {
						setPayments([]);
						setLoading(false);
					}
					return;
				}

				const url = ledaId ? `${baseUrl}?ledaId=${ledaId}` : baseUrl;
				const response = await fetch(url, {
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error(
						`API returned ${response.status}: ${response.statusText}`
					);
				}

				let data = await response.json();
				data = Array.isArray(data) ? data : data?.payments || [];

				// Map paymentDate to date for consistency
				data = data.map((payment: PaymentHistory) => ({
					...payment,
					date: payment.date || payment.date,
				}));

				// Filter by selected date if not "all"
				if (selectedDate !== "all") {
					data = data.filter((payment: PaymentHistory) => {
						const paymentDate = String(payment.date || "");
						if (!paymentDate) return false;
						const paymentUTC = new Date(paymentDate + (paymentDate.endsWith("Z") ? "" : "T00:00:00Z"));
						const selectedUTC = new Date(selectedDate + "T00:00:00Z");
						return paymentUTC.toISOString().slice(0, 10) === selectedUTC.toISOString().slice(0, 10);
					});
				}

				// Filter by selected payment type if one is selected
				if (appliedPaymentType) {
					data = data.filter((payment: PaymentHistory) => {
						// Handle field name mismatch - payment data uses 'type' field but selector uses 'paymentType'
						return payment.type === appliedPaymentType.paymentType;
					});
				}

				// Sort data by date in descending order (newest dates first)
				data.sort((a: PaymentHistory, b: PaymentHistory) => {
					const dateA = new Date(String(a.date || "") + (String(a.date || "").endsWith("Z") ? "" : "T00:00:00Z"));
					const dateB = new Date(String(b.date || "") + (String(b.date || "").endsWith("Z") ? "" : "T00:00:00Z"));
					return dateB.getTime() - dateA.getTime();
				});

				if (isMounted) {
					setPayments(data);
				}
			} catch (error: unknown) {
				// Only handle errors that are not abort errors
				if (error instanceof Error && error.name === "AbortError") {
					// Ignore abort errors
					return;
				}
				console.error("Payment fetch error:", error);
				if (isMounted) {
					setPayments([]);
					setError(
						error instanceof Error
							? error.message
							: "Failed to load payment data"
					);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		fetchPayments();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [type, ledaId, selectedDate, appliedPaymentType]);

	// Function to delete a payment record
	const handleDeletePayment = async (payment: PaymentHistory) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this payment record? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			let baseRoute = "";
			if (type === "player") baseRoute = playerPaymentHistoryRoute;
			else if (type === "team") baseRoute = teamPaymentHistoryRoute;
			else if (type === "place") baseRoute = placePaymentHistoryRoute;
			else return;

			const response = await fetch(`${baseRoute}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payment),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to delete payment: ${response.statusText}`
				);
			}

			// Refresh the payment data after successful deletion
			refreshPayments();
			window.location.reload();
		} catch (error) {
			console.error("Error deleting payment:", error);
			alert("Failed to delete payment. Please try again.");
		}
	};

	return (
		<div className="w-full">
			<div className="flex justify-between items-center mb-4">
				<PaymentHistoryFormDialog
					buttonText={`Add ${capitalizedType} Payment`}
					onSuccess={refreshPayments}
					initialLedaId={ledaId}
					route={
						type === "player"
							? playerPaymentHistoryRoute
							: type === "team"
							? teamPaymentHistoryRoute
							: placePaymentHistoryRoute
					}
					type={type}
				/>
				<div className="flex gap-2">
					<Select
						value={selectedDate}
						onValueChange={setSelectedDate}
					>
						<SelectTrigger className="w-[200px] border-gray-400 text-gray-700">
							<SelectValue placeholder="Filter by date" />
						</SelectTrigger>
						<SelectContent className="bg-white border-gray-400 text-gray-700">
							<SelectItem value="all">All Dates</SelectItem>
							{Array.isArray(uniqueDates) &&
								uniqueDates.map((date, index) => (
									<SelectItem
										key={`${date.paymentDate}-${index}`}
										value={date.paymentDate}
									>
										{date.paymentDate
											? new Date(
													date.paymentDate + "T00:00:00Z"
											  ).toLocaleDateString("en-US", { timeZone: "UTC" })
											: "Unknown date"}
									</SelectItem>
								))}
						</SelectContent>
					</Select>

					<Popover open={filterOpen} onOpenChange={setFilterOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="border-gray-400 text-gray-700"
							>
								<FilterIcon className="h-4 w-4 mr-2" />
								{appliedPaymentType
									? "Payment Type Filter"
									: "Filter by Type"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80 p-4 bg-white border-gray-400 text-gray-700">
							<div className="space-y-4">
								<h4 className="font-medium">
									Filter by Payment Type
								</h4>
								<PaymentTypeSelectorNF
									value={selectedPaymentType}
									onChange={setSelectedPaymentType}
									label="Payment Type"
								/>
								<div className="flex justify-between mt-4">
									<Button
										variant="outline"
										onClick={clearFilters}
										className="text-sm border-gray-400 text-gray-700"
									>
										Clear Filters
									</Button>
									<Button
										onClick={applyFilter}
										className="text-sm border-gray-400 text-gray-700"
									>
										Apply
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{/* Show active filters if any are applied */}
			{(selectedDate !== "all" || appliedPaymentType) && (
				<div className="flex gap-2 mb-4 items-center">
					<span className="text-sm text-gray-500">
						Active filters:
					</span>
					{selectedDate !== "all" && (
						<Button
							variant="outline"
							size="sm"
							className="text-xs flex items-center gap-1 bg-gray-100"
							onClick={() => setSelectedDate("all")}
						>
							Date: {new Date(selectedDate + "T00:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC" })}
							<XIcon className="h-3 w-3" />
						</Button>
					)}
					{appliedPaymentType && (
						<Button
							variant="outline"
							size="sm"
							className="text-xs flex items-center gap-1 bg-gray-100"
							onClick={() => {
								setAppliedPaymentType(undefined);
								setSelectedPaymentType(undefined);
							}}
						>
							Type: {appliedPaymentType.paymentType}
							<XIcon className="h-3 w-3" />
						</Button>
					)}
				</div>
			)}

			{loading ? (
				<div className="flex justify-center items-center h-40">
					<p>Loading payments...</p>
				</div>
			) : error ? (
				<div className="flex justify-center items-center h-40 text-red-500">
					<p>{error}</p>
				</div>
			) : payments.length > 0 ? (
				<>
					<Accordion type="single" collapsible className="w-full">
						{currentRecords.map((payment) => (
							<AccordionItem
								key={payment.paymentNbr}
								value={`payment-${payment.paymentNbr}`}
							>
								<AccordionTrigger className="flex flex-row w-full text-left px-4 py-2 hover:bg-gray-50 gap-6">
									<div className="flex flex-col">
										<span className="text-xs text-gray-500">
											Payment #
										</span>
										<span>{payment.paymentNbr}</span>
									</div>
									<div className="flex flex-col">
										<span className="text-xs text-gray-500">
											LEDA ID
										</span>
										<span>{payment.ledaId}</span>
									</div>
									<div className="flex flex-col">
										<span className="text-xs text-gray-500">
											Name
										</span>
										<span>{payment.fullName || "N/A"}</span>
									</div>
									<div className="flex flex-col">
										<span className="text-xs text-gray-500">
											Amount
										</span>
										<span>{payment.amount}</span>
									</div>
									<div className="flex flex-col">
										<span className="text-xs text-gray-500">
											Date
										</span>
										<span>
											{payment.date
												? new Date(
														String(payment.date) + (String(payment.date).endsWith("Z") ? "" : "T00:00:00Z")
												  ).toLocaleDateString("en-US", { timeZone: "UTC" })
												: "N/A"}
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-6 py-4 bg-gray-50">
									<div className="flex justify-end mb-2 gap-2">
										<PaymentHistoryFormDialog
											buttonText=""
											buttonIcon={
												<PencilIcon className="h-4 w-4" />
											}
											onSuccess={refreshPayments}
											initialLedaId={ledaId}
											route={
												type === "player"
													? playerPaymentHistoryRoute
													: type === "team"
													? teamPaymentHistoryRoute
													: placePaymentHistoryRoute
											}
											paymentData={payment}
											isEditing={true}
											type={type}
										/>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												handleDeletePayment(payment);
											}}
											className="text-red-600 hover:text-red-800 hover:bg-red-100"
										>
											<XIcon className="h-4 w-4" />
										</Button>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="font-semibold">
												Type:
											</p>
											<p>{payment.type}</p>
										</div>
										<div>
											<p className="font-semibold">
												Payment Type:
											</p>
											<p>{payment.paymentType}</p>
										</div>
										<div>
											<p className="font-semibold">
												Season Code:
											</p>
											<p>{payment.seasonCode}</p>
										</div>
										<div>
											<p className="font-semibold">
												Fiscal Year:
											</p>
											<p>{payment.fiscalYear}</p>
										</div>
										<div>
											<p className="font-semibold">
												Comp:
											</p>
											<p>{payment.comp ? "Yes" : "No"}</p>
										</div>
										<div>
											<p className="font-semibold">
												Paid Off:
											</p>
											<p>
												{payment.paidOff ? "Yes" : "No"}
											</p>
										</div>
										{payment.notes && (
											<div className="col-span-2">
												<p className="font-semibold">
													Notes:
												</p>
												<p>{payment.notes}</p>
											</div>
										)}
									</div>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>

					{/* Pagination Controls */}
					<div className="flex items-center justify-between mt-6">
						<div className="text-sm text-gray-700">
							Showing{" "}
							<span className="font-medium">
								{indexOfFirstRecord + 1}
							</span>{" "}
							to{" "}
							<span className="font-medium">
								{Math.min(indexOfLastRecord, payments.length)}
							</span>{" "}
							of{" "}
							<span className="font-medium">
								{payments.length}
							</span>{" "}
							results
						</div>
						<div className="flex space-x-2">
							<Button
								onClick={() =>
									setCurrentPage((prev) =>
										Math.max(prev - 1, 1)
									)
								}
								disabled={currentPage === 1}
								className={`px-3 py-1 rounded ${
									currentPage === 1
										? "hover:bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
										: "hover:bg-gray-100 border-gray-300 text-gray-700"
								}`}
							>
								Previous
							</Button>
							{Array.from(
								{ length: Math.min(5, totalPages) },
								(_, i) => {
									// Show current page and two pages on either side if possible
									const pageNum = Math.min(
										Math.max(currentPage - 2 + i, 1),
										totalPages
									);
									return (
										<Button
											key={pageNum}
											onClick={() =>
												setCurrentPage(pageNum)
											}
											className={`px-3 py-1 rounded ${
												currentPage === pageNum
													? " bg-gray-300 hover:bg-gray-100 border-gray-300 text-gray-700"
													: "bg-gray-200 hover:bg-gray-100 border-gray-300 text-gray-700"
											}`}
										>
											{pageNum}
										</Button>
									);
								}
							)}
							<Button
								onClick={() =>
									setCurrentPage((prev) =>
										Math.min(prev + 1, totalPages)
									)
								}
								disabled={currentPage === totalPages}
								className={`px-3 py-1 rounded ${
									currentPage === totalPages
										? "hover:bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
										: "hover:bg-gray-100 border-gray-300 text-gray-700"
								}`}
							>
								Next
							</Button>
						</div>
					</div>
				</>
			) : (
				<div className="flex justify-center items-center h-40">
					<p>No payment records found.</p>
				</div>
			)}
		</div>
	);
}
