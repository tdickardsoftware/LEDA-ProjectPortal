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
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = React.useState(""); // State for search input
	const [debouncedQuery, setDebouncedQuery] = React.useState(""); // State for debounced query
	const [tableData, setTableData] = React.useState(data); // State for table data
	const [rowSelection, setRowSelection] = React.useState({}); // State for row selection
	const [selectedRowCount, setSelectedRowCount] = React.useState(0); // New state for selected row count

	// Debounce the search input
	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300); // Update after 300ms of inactivity

		return () => clearTimeout(handler); // Cleanup on each change
	}, [searchQuery]);

	// Extract selected rows' data
	const selectedRowsData = React.useMemo(() => {
		return Object.keys(rowSelection).map((key) => tableData[parseInt(key)]);
	}, [rowSelection, tableData]);

	// Update selectedRowCount whenever rowSelection changes
	React.useEffect(() => {
		setSelectedRowCount(Object.keys(rowSelection).length);
		if (passValueToParent) {
			passValueToParent(JSON.stringify(selectedRowsData)); // Send selected row data to parent
		}
	}, [rowSelection, passValueToParent, selectedRowsData]);

	// Filtered data based on debounced query
	const filteredData = React.useMemo(() => {
		if (!debouncedQuery) return tableData;
		return tableData.filter((row) =>
			Object.values(row).some((value) =>
				String(value)
					.toLowerCase()
					.includes(debouncedQuery.toLowerCase())
			)
		);
	}, [debouncedQuery, tableData]);

	const table = useReactTable({
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
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
