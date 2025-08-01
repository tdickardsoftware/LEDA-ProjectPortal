"use client";

import * as React from "react";
import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
	getSortedRowModel,
	CellContext,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import RosterSeasonCodeSelector from "@/components/ui/roster-season-code-selector";
import { Checkbox } from "@/components/ui/checkbox";
import {
	placePaymentHistoryRoute,
	rosterRoute,
	teamPaymentHistoryRoute,
} from "@/lib/apiRoutes";
// Import the required icons and paymentRoute
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { playerPaymentHistoryRoute } from "@/lib/apiRoutes";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";

// Add interface for payment status data
interface PaymentStatus {
	ledaId: string | number;
	status: "PAID" | "PART" | "UNPAID";
}

interface DataTableProps<TData extends Record<string, unknown>, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pageName: string;
	addDialog?: React.ReactNode;
	deleteDialog?: React.ReactNode;
	editDialog?: React.ReactNode;
	viewLink?: React.ReactNode;
	onRefresh?: (api: string) => void;
	apiEndpoint: string; // New prop for API endpoint
	defaultSort?: string;
	singleRowSelection?: boolean;
	passValueToParent?: (value: string) => void;
	defaultSelectedRow?: number; // Optional prop for default selected row
	filter?: boolean; // New optional prop
}

export function DataTable<TData extends Record<string, unknown>, TValue>({
	columns,
	data,
	pageName,
	addDialog,
	deleteDialog,
	editDialog,
	viewLink,
	onRefresh,
	apiEndpoint, // Destructure the new prop
	defaultSort,
	singleRowSelection,
	passValueToParent,
	defaultSelectedRow,
	filter,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = React.useState(""); // State for search input
	const [debouncedQuery, setDebouncedQuery] = React.useState(""); // State for debounced query
	const [tableData, setTableData] = React.useState(data); // State for table data
	const [rowSelection, setRowSelection] = React.useState({}); // State for row selection
	const [selectedRowCount, setSelectedRowCount] = React.useState(0); // New state for selected row count

	// Filter state
	const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false);
	const [filterSeasonCode, setFilterSeasonCode] = React.useState<string>("");
	const [filterCurrentSeason, setFilterCurrentSeason] =
		React.useState<boolean>(true);
	const [filteredLedaIds, setFilteredLedaIds] = React.useState<
		string[] | null
	>(null);
	const [filterLoading, setFilterLoading] = React.useState(false);

	// Add new state for payment status
	const [showPaymentStatus, setShowPaymentStatus] =
		React.useState<boolean>(false);

	// Add local state for the Show Payment Status checkbox
	const [pendingShowPaymentStatus, setPendingShowPaymentStatus] =
		React.useState<boolean>(false);

	// --- TanStack Query: Fetch payment status data ---
	const {
		data: paymentStatusData = [],
		isFetching: paymentStatusLoading,
		refetch: refetchPaymentStatus,
	} = useQuery<PaymentStatus[]>({
		queryKey: [
			"datatablePaymentStatus",
			pageName,
			filterSeasonCode,
			showPaymentStatus,
		],
		enabled: !!showPaymentStatus && !!filterSeasonCode,
		queryFn: async () => {
			let res;
			if (pageName.includes("Players")) {
				res = await fetch(
					`${playerPaymentHistoryRoute}/viewData?seasonCode=${filterSeasonCode}`
				);
			} else if (pageName.includes("Places")) {
				res = await fetch(
					`${placePaymentHistoryRoute}/viewData?seasonCode=${filterSeasonCode}`
				);
			} else {
				res = await fetch(
					`${teamPaymentHistoryRoute}/viewData?seasonCode=${filterSeasonCode}`
				);
			}
			const data = await res.json();
			return Array.isArray(data) ? data : [];
		},
	});

	// Debounce the search input
	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300);
		return () => clearTimeout(handler);
	}, [searchQuery]);

	// When filterCurrentSeason changes, reset filterSeasonCode and pendingShowPaymentStatus if needed
	React.useEffect(() => {
		if (filterCurrentSeason) {
			setFilterSeasonCode("");
			setPendingShowPaymentStatus(false);
			setShowPaymentStatus(false);
		}
	}, [filterCurrentSeason]);

	// Only fetch payment status when showPaymentStatus is set (after Apply)
	React.useEffect(() => {
		if (showPaymentStatus && filterSeasonCode) {
			refetchPaymentStatus();
		}
		// No else branch needed, paymentStatusData will be empty if not enabled
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showPaymentStatus, filterSeasonCode]);

	const handleApplyFilter = async () => {
		if (!filterSeasonCode) return;
		setFilterLoading(true);
		try {
			let res;
			if (pageName.includes("Players")) {
				res = await fetch(
					`${rosterRoute}/rosterPlayerView?seasonCode=${filterSeasonCode}`
				);
			} else if (pageName.includes("Places")) {
				res = await fetch(
					`${rosterRoute}/rosterPlaceView?seasonCode=${filterSeasonCode}`
				);
			} else {
				res = await fetch(
					`${rosterRoute}/rosterTeamView?seasonCode=${filterSeasonCode}`
				);
			}
			const ids: { ledaId: string | number }[] = await res.json();
			// Extract ledaId values from the array of objects
			const ledaIds = Array.isArray(ids)
				? ids.map((item) => String(item.ledaId))
				: [];
			setFilteredLedaIds(ledaIds);
			setShowPaymentStatus(pendingShowPaymentStatus); // Only set showPaymentStatus on Apply
			setFilterPopoverOpen(false);
		} catch (e) {
			console.error("Failed to filter by season", e);
		} finally {
			setFilterLoading(false);
		}
	};

	// Filtered data based on debounced query and filter
	const filteredData = React.useMemo(() => {
		let base = tableData;
		if (filteredLedaIds) {
			base = base.filter((row) =>
				filteredLedaIds.includes(String(row.ledaId))
			);
		}
		if (!debouncedQuery) return base;
		return base.filter((row) =>
			Object.values(row).some((value) =>
				String(value)
					.toLowerCase()
					.includes(debouncedQuery.toLowerCase())
			)
		);
	}, [debouncedQuery, tableData, filteredLedaIds]);

	// Function to get payment status for a given ledaId
	const getPaymentStatus = React.useCallback(
		(ledaId: string | number) => {
			const paymentRecord = paymentStatusData.find(
				(p) => String(p.ledaId) === String(ledaId)
			);
			return paymentRecord?.status || null;
		},
		[paymentStatusData]
	);

	// Helper to render payment status icon with tooltip
	const renderPaymentStatusIcon = React.useCallback(
		(ledaId: string | number) => {
			if (!showPaymentStatus || paymentStatusData.length === 0)
				return null;

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
						<TooltipContent className="bg-white rounded-lg">
							{tooltipText}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
		[showPaymentStatus, paymentStatusData, getPaymentStatus]
	);

	// Enhance columns with payment status if enabled
	const enhancedColumns = React.useMemo(() => {
		if (!showPaymentStatus || paymentStatusData.length === 0)
			return columns;

		return columns.map((col) => {
			// Find the column that likely contains the name (assuming it has 'name' in the id or accessorKey)
			const isNameColumn =
				col.id?.toLowerCase().includes("name") ||
				("accessorKey" in col &&
					typeof col.accessorKey === "string" &&
					col.accessorKey.toLowerCase().includes("name"));

			if (isNameColumn) {
				return {
					...col,
					cell: (info: CellContext<TData, TValue>) => {
						// Render the original cell content
						let originalContent: React.ReactNode;
						if (col.cell) {
							originalContent = flexRender(col.cell, info);
						} else if (
							"accessorKey" in col &&
							typeof col.accessorKey === "string"
						) {
							originalContent = String(
								info.row.original[col.accessorKey]
							);
						} else {
							originalContent = String(info.getValue());
						}
						const ledaId = info.row.original.ledaId;

						// Render both the original content and the icon
						return (
							<div className="flex items-center">
								{originalContent}
								{renderPaymentStatusIcon(Number(ledaId))}
							</div>
						);
					},
				};
			}
			return col;
		});
	}, [
		columns,
		showPaymentStatus,
		paymentStatusData,
		renderPaymentStatusIcon,
	]);

	const table = useReactTable({
		// Assign table instance to ref
		// Removed invalid onTableInstanceChange property
		data: filteredData, // Use filtered data here
		columns: enhancedColumns, // Use enhanced columns instead of original columns
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		enableMultiRowSelection: !singleRowSelection,
		state: {
			sorting,
			rowSelection,
		},
		initialState: {
			sorting: [{ id: defaultSort ? defaultSort : "", desc: false }],
		},
	});

	// Extract selected rows' data
	const selectedRowsData = React.useMemo(() => {
		const selectedRowIds = Object.keys(rowSelection);
		// Get row data directly from the table's row model rather than using tableData indices
		return table
			.getRowModel()
			.rows.filter((row) => selectedRowIds.includes(row.id))
			.map((row) => row.original);
	}, [rowSelection, table]);

	// Update selectedRowCount whenever rowSelection changes
	React.useEffect(() => {
		setSelectedRowCount(Object.keys(rowSelection).length);
		if (passValueToParent) {
			passValueToParent(JSON.stringify(selectedRowsData)); // Send selected row data to parent
		}
	}, [rowSelection, passValueToParent, selectedRowsData]);
	// Refresh the table data
	const handleRefresh = async () => {
		try {
			const response = await fetch(apiEndpoint); // Use the dynamic API endpoint
			const newData = await response.json();
			setTableData(newData);
			setRowSelection({}); // Clear row selection on refresh
		} catch (error) {
			console.error("Failed to refresh data", error);
		}
	};

	React.useEffect(() => {
		handleRefresh(); // Call handleRefresh without arguments
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onRefresh]);

	// Set default selected row if provided
	React.useEffect(() => {
		if (defaultSelectedRow !== undefined && defaultSelectedRow >= 0) {
			setRowSelection({ [defaultSelectedRow]: true });
		}
	}, [defaultSelectedRow]);

	return (
		<div className="w-full">
			<div className="p-5 shadow-sm bg-white rounded-xl border border-gray-200 w-full transition-all">
				<div className="overflow-hidden rounded-lg">
					<h1 className="text-2xl font-medium pb-4 text-center text-gray-700">
						{pageName}
					</h1>
					<div className="flex items-center justify-between space-x-3 mb-4">
						{addDialog ? (
							<div>
								{React.cloneElement(
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									addDialog as React.ReactElement<any>,
									{ onRefresh: handleRefresh }
								)}
							</div>
						) : null}
						<div className="flex space-x-2">
							{/* Filter By Season Button and Popover */}
							{filter && (
								<Popover
									open={filterPopoverOpen}
									onOpenChange={setFilterPopoverOpen}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className="hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
											onClick={() =>
												setFilterPopoverOpen(true)
											}
										>
											Filter By Season
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[260px] bg-white shadow-md rounded-lg border border-gray-200 p-4">
										<div className="flex flex-col gap-3">
											<RosterSeasonCodeSelector
												disabled={filterCurrentSeason}
												handleSelect={
													setFilterSeasonCode
												}
												useCurrentSeason={
													filterCurrentSeason
												}
												seasonCode={filterSeasonCode}
											/>
											<div className="flex items-center gap-2">
												<Checkbox
													checked={
														filterCurrentSeason
													}
													onCheckedChange={() =>
														setFilterCurrentSeason(
															!filterCurrentSeason
														)
													}
												/>
												<span className="text-gray-700 text-sm">
													Current Season?
												</span>
											</div>
											{/* Show Payment Status checkbox only affects pendingShowPaymentStatus */}
											{filterSeasonCode && (
												<div className="flex items-center gap-2">
													<Checkbox
														checked={
															pendingShowPaymentStatus
														}
														onCheckedChange={() =>
															setPendingShowPaymentStatus(
																!pendingShowPaymentStatus
															)
														}
														disabled={
															paymentStatusLoading
														}
													/>
													<span className="text-gray-700 text-sm">
														Show Payment Status
													</span>
													{paymentStatusLoading && (
														<span className="text-xs ml-2 text-gray-500">
															(Loading...)
														</span>
													)}
												</div>
											)}
											<Button
												onClick={handleApplyFilter}
												disabled={
													!filterSeasonCode ||
													filterLoading
												}
												className="w-full hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
											>
												{filterLoading
													? "Applying..."
													: "Apply"}
											</Button>
											{filteredLedaIds && (
												<Button
													variant="ghost"
													onClick={() => {
														setFilteredLedaIds(
															null
														);
														setShowPaymentStatus(
															false
														);
														setPendingShowPaymentStatus(
															false
														);
													}}
													className="w-full text-xs text-gray-500 hover:text-gray-800 transition-colors"
												>
													Clear Filter
												</Button>
											)}
										</div>
									</PopoverContent>
								</Popover>
							)}
							{/* ...existing code for viewLink, editDialog, deleteDialog... */}
							{viewLink ? (
								<div>
									{React.cloneElement(
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										viewLink as React.ReactElement<any>,
										{
											disabled:
												selectedRowCount === 1
													? false
													: true,
											href: `/Portal/${
												selectedRowsData[0]?.ledaId
													? "Management"
													: "Maintenance"
											}/**REPLACE**/${
												selectedRowsData[0]?.ledaId ??
												selectedRowsData[0]?.seasonCode
											}`,
										}
									)}
								</div>
							) : null}
							{editDialog ? (
								<div>
									{React.cloneElement(
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										editDialog as React.ReactElement<any>,
										{
											disabled:
												selectedRowCount === 1
													? false
													: true,
											rowData: selectedRowsData[0], // Pass the first selected row's data
											onRefresh: handleRefresh,
										}
									)}
								</div>
							) : null}
							{deleteDialog ? (
								<div>
									{React.cloneElement(
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										deleteDialog as React.ReactElement<any>,
										{
											selectedRowCount,
											disabled:
												selectedRowCount > 0
													? false
													: true,
											rowData: selectedRowsData, // Pass the selected rows' data
											onRefresh: handleRefresh,
										}
									)}
								</div>
							) : null}
						</div>
					</div>
					{/* Search Input */}
					<div className="mb-4">
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search..."
							className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all"
						/>
					</div>

					<div className="border border-gray-200 rounded-lg overflow-hidden">
						<Table className="min-w-full">
							<TableHeader className="bg-gray-50 border-b">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow
										key={headerGroup.id}
										className="border-gray-200"
									>
										{headerGroup.headers.map((header) => (
											<TableHead
												key={header.id}
												className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
											>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column
																.columnDef
																.header,
															header.getContext()
													  )}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
											data-state={
												row.getIsSelected() &&
												"selected"
											}
										>
											{row
												.getVisibleCells()
												.map((cell) => (
													<TableCell
														key={cell.id}
														className="px-6 py-3 text-sm text-gray-700"
													>
														{flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center text-gray-500"
										>
											No Results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
				<div className="flex items-center justify-between space-x-2 py-4 mt-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
					>
						Previous
					</Button>
					<div className="text-sm text-gray-500">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}