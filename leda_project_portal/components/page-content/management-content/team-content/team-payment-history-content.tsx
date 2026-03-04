"use client";

/**
 * TeamPaymentHistoryContent
 *
 * Displays a team's full payment history with date and payment-type filters.
 * Filtering is client-side over the TanStack Query result from
 * `teamPaymentHistoryRoute`.
 *
 * - Date filter: dropdown of unique UTC-formatted payment dates.
 * - Type filter: popover using `PaymentTypeSelectorNF` with Apply / Clear.
 *
 * All dates are derived in UTC to prevent day-shift rendering artefacts.
 */

import { PaymentHistory } from "@/lib/definitions";
import { teamPaymentHistoryRoute } from "@/lib/apiRoutes";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { FilterIcon, XIcon } from "lucide-react";
import PaymentTypeSelectorNF from "@/components/ui/payment-type-selector-nf";

export default function TeamPaymentHistoryContent({
	teamData,
}: {
	teamData: { ledaId: number; teamName: string };
}) {
	const [selectedDate, setSelectedDate] = useState<string>("all");
	const [selectedPaymentType, setSelectedPaymentType] = useState<
		{ paymentType: string; desc: string } | undefined
	>(undefined);
	const [appliedPaymentType, setAppliedPaymentType] = useState<
		{ paymentType: string; desc: string } | undefined
	>(undefined);
	const [filterOpen, setFilterOpen] = useState(false);

	const {
		data: paymentData = [],
		isLoading,
		error,
	} = useQuery<PaymentHistory[]>({
		queryKey: ["teamPaymentHistory", teamData.ledaId],
		queryFn: async () => {
			const results = await fetch(
				`${teamPaymentHistoryRoute}?teamId=${teamData.ledaId}`,
				{
					method: "GET",
				}
			);
			if (!results.ok) {
				throw new Error("Failed to fetch payment data");
			}
			return await results.json();
		},
	});

	const uniqueDates: { paymentDate: string }[] = [
		...new Set(
			(paymentData || []).map((item: PaymentHistory) => {
				if (!item.date) return null;
				const date = new Date(item.date);
				return `${date.getUTCFullYear()}-${String(
					date.getUTCMonth() + 1
				).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
			})
		),
	]
		.filter(Boolean)
		.map((date) => ({ paymentDate: date as string }));

	const filteredPaymentData = (paymentData || []).filter((payment) => {
		let matchesDate = true;
		let matchesType = true;

		if (selectedDate !== "all") {
			if (payment.date) {
				const paymentDate = new Date(payment.date);
				const paymentDateStr = `${paymentDate.getUTCFullYear()}-${String(
					paymentDate.getUTCMonth() + 1
				).padStart(2, "0")}-${String(paymentDate.getUTCDate()).padStart(
					2,
					"0"
				)}`;
				matchesDate = paymentDateStr === selectedDate;
			} else {
				matchesDate = false;
			}
		}

		if (appliedPaymentType) {
			matchesType = payment.type === appliedPaymentType.paymentType;
		}

		return matchesDate && matchesType;
	});

	const clearFilters = () => {
		setSelectedDate("all");
		setSelectedPaymentType(undefined);
		setAppliedPaymentType(undefined);
		setFilterOpen(false);
	};

	const applyFilter = () => {
		setAppliedPaymentType(selectedPaymentType);
		setFilterOpen(false);
	};

	return (
		<div className="container mx-auto p-6">
			<div>
				<h1 className="text-4xl font-bold mb-4">
					Team Payment History
				</h1>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold">
						Team: #{teamData.ledaId} - {teamData.teamName}
					</h2>
					<div className="flex gap-2">
						<Select
							value={selectedDate}
							onValueChange={setSelectedDate}
						>
							<SelectTrigger className="w-[200px] border-border text-foreground">
								<SelectValue placeholder="Filter by date" />
							</SelectTrigger>
							<SelectContent className="bg-background border-border text-foreground">
								<SelectItem value="all">All Dates</SelectItem>
								{uniqueDates.map((date, index) => (
									<SelectItem
										key={`${date.paymentDate}-${index}`}
										value={date.paymentDate}
									>
										{date.paymentDate
											? (() => {
													const [year, month, day] =
														date.paymentDate
															.split("-")
															.map(Number);
													return new Date(
														year,
														month - 1,
														day
													).toLocaleDateString("en-US", {
														timeZone: "UTC",
													});
											  })()
											: "Unknown date"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Popover open={filterOpen} onOpenChange={setFilterOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="border-border text-foreground"
								>
									<FilterIcon className="h-4 w-4 mr-2" />
									{appliedPaymentType
										? "Payment Type Filter"
										: "Filter by Type"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 p-4 bg-background border-border text-foreground">
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
											className="text-sm border-border text-foreground"
										>
											Clear Filters
										</Button>
										<Button
											onClick={applyFilter}
											className="text-sm border-border text-foreground"
										>
											Apply
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>
				{(selectedDate !== "all" || appliedPaymentType) && (
					<div className="flex gap-2 mb-4 items-center">
						<span className="text-sm text-muted-foreground">
							Active filters:
						</span>
						{selectedDate !== "all" && (
							<Button
								variant="outline"
								size="sm"
								className="text-xs flex items-center gap-1 bg-muted"
								onClick={() => setSelectedDate("all")}
							>
								Date:{" "}
								{(() => {
									const [year, month, day] = selectedDate
										.split("-")
										.map(Number);
									return new Date(
										Date.UTC(year, month - 1, day)
									).toLocaleDateString("en-US", {
										timeZone: "UTC",
									});
								})()}
								<XIcon className="h-3 w-3" />
							</Button>
						)}
						{appliedPaymentType && (
							<Button
								variant="outline"
								size="sm"
								className="text-xs flex items-center gap-1 bg-muted"
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
				{isLoading ? (
					<p className="text-muted-foreground italic">
						Loading payment history...
					</p>
				) : error ? (
					<p className="text-red-500">
						{(error as Error).message || "Failed to load payment history data"}
					</p>
				) : filteredPaymentData.length === 0 ? (
					<p className="text-muted-foreground">
						No payment history found for this team.
					</p>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Payment #</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Payment Type</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Season Code</TableHead>
									<TableHead>Fiscal Year</TableHead>
									<TableHead>Paid Off</TableHead>
									<TableHead>Comp</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Notes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="max-h-[400px] overflow-y-auto">
								{filteredPaymentData.map((payment, index) => (
									<TableRow key={index}>
										<TableCell>
											{payment.paymentNbr}
										</TableCell>
										<TableCell>{payment.type}</TableCell>
										<TableCell>
											{payment.paymentType}
										</TableCell>
										<TableCell>{payment.amount}</TableCell>
										<TableCell>
											{payment.seasonCode}
										</TableCell>
										<TableCell>
											{payment.fiscalYear}
										</TableCell>
										<TableCell>
											{payment.paidOff ? "Yes" : "No"}
										</TableCell>
										<TableCell>
											{payment.comp ? "Yes" : "No"}
										</TableCell>
										<TableCell>
											{payment.date
												? (() => {
														const date = new Date(payment.date);
														return date.toLocaleDateString("en-US", {
															timeZone: "UTC",
														});
												  })()
												: "N/A"}
										</TableCell>
										<TableCell className="max-w-[200px] truncate">
											{payment.notes || "N/A"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</div>
	);
}