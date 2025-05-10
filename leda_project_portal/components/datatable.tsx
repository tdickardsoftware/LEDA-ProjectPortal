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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RosterSeasonCodeSelector from "@/components/ui/roster-season-code-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { rosterRoute } from "@/lib/apiRoutes";

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
	const [filterCurrentSeason, setFilterCurrentSeason] = React.useState<boolean>(true);
	const [filteredLedaIds, setFilteredLedaIds] = React.useState<string[] | null>(null);
	const [filterLoading, setFilterLoading] = React.useState(false);

	// Debounce the search input
	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300); // Update after 300ms of inactivity

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchQuery]);

	// When filterCurrentSeason changes, reset filterSeasonCode if needed
	React.useEffect(() => {
		if (filterCurrentSeason) setFilterSeasonCode("");
	}, [filterCurrentSeason]);

	const handleApplyFilter = async () => {
		if (!filterSeasonCode) return;
		setFilterLoading(true);
		try {
			let res;
			if (pageName.includes("Players")) {
				res = await fetch(`${rosterRoute}/rosterPlayerView?seasonCode=${filterSeasonCode}`);
			} else if (pageName.includes("Places")) {
				res = await fetch(`${rosterRoute}/rosterPlaceView?seasonCode=${filterSeasonCode}`);
			} else {
				res = await fetch(`${rosterRoute}/rosterTeamView?seasonCode=${filterSeasonCode}`);
			}
			const ids: { ledaId: string | number }[] = await res.json();
			// Extract ledaId values from the array of objects
			const ledaIds = Array.isArray(ids) ? ids.map((item) => String(item.ledaId)) : [];
			setFilteredLedaIds(ledaIds);
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
			base = base.filter(row => filteredLedaIds.includes(String(row.ledaId)));
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

	const table = useReactTable({
		// Assign table instance to ref
		// Removed invalid onTableInstanceChange property
		data: filteredData, // Use filtered data here
		columns,
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
		return table.getRowModel().rows
			.filter(row => selectedRowIds.includes(row.id))
			.map(row => row.original);
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
		<div>
			<div className="p-4 shadow-lg bg-white rounded-lg border border-gray-200 w-full max-w-4xl">
				<div className="overflow-hidden rounded-md">
					<h1 className="text-3xl pb-4 text-center">{pageName}</h1>
					<div className="flex items-center justify-between space-x-2">
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
								<Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
									<PopoverTrigger asChild>
										<Button variant="outline" className="hover:bg-gray-100 border-gray-300 text-gray-700" onClick={() => setFilterPopoverOpen(true)}>
											Filter By Season
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[260px] bg-white">
										<div className="flex flex-col gap-3">
											<RosterSeasonCodeSelector
												disabled={filterCurrentSeason}
												handleSelect={setFilterSeasonCode}
												useCurrentSeason={filterCurrentSeason}
												seasonCode={filterSeasonCode}
											/>
											<div className="flex items-center gap-2">
												<Checkbox
													checked={filterCurrentSeason}
													onCheckedChange={() => setFilterCurrentSeason(!filterCurrentSeason)}
												/>
												<span>Current Season?</span>
											</div>
											<Button
												onClick={handleApplyFilter}
												disabled={!filterSeasonCode || filterLoading}
												className="w-full"
											>
												{filterLoading ? "Applying..." : "Apply"}
											</Button>
											{filteredLedaIds && (
												<Button
													variant="ghost"
													onClick={() => setFilteredLedaIds(null)}
													className="w-full text-xs text-gray-500"
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
					<div className="mb-4 py-2">
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search..."
							className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</div>

					<Table className="min-w-full divide-y divide-gray-200 border">
						<TableHeader className="bg-gray-200">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef
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
										className="hover:bg-zinc-300 transition-colors"
										data-state={
											row.getIsSelected() && "selected"
										}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
											>
												{flexRender(
													cell.column.columnDef.cell,
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
				<div className="flex items-center justify-between space-x-2 py-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="hover:bg-gray-100 border-gray-300 text-gray-700"
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="hover:bg-gray-100 border-gray-300 text-gray-700"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
