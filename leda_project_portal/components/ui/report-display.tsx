"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface ColumnDef<T> {
	key: string;
	header: string;
	accessor: (row: T) => React.ReactNode;
	sortable?: boolean;
}

interface ReportDisplayProps<T> {
	apiRoute: string;
	columns: ColumnDef<T>[];
	className?: string;
	onDataFetch?: (data: T[]) => void;
}

export default function ReportDisplay<T extends Record<string, unknown>>({
	apiRoute,
	columns,
	className = "",
	onDataFetch,
}: ReportDisplayProps<T>) {
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);

	// TanStack Query hook
	const {
		data: fetchedData = [],
		error,
		isLoading: loading,
		refetch,
	} = useQuery<T[]>({
		queryKey: ["reportData", apiRoute],
		queryFn: async () => {
			if (!apiRoute) {
				return [];
			}
			const response = await fetch(apiRoute);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			return result.data || result;
		},
		enabled: !!apiRoute,
		staleTime: 60 * 1000, // 1 minute
		retry: 1,
	});

	// Call onDataFetch callback when data changes
	useEffect(() => {
		if (fetchedData.length > 0 && onDataFetch) {
			onDataFetch(fetchedData);
		}
	}, [fetchedData, onDataFetch]);

	const handleSort = (columnKey: string) => {
		if (sortColumn === columnKey) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(columnKey);
			setSortDirection("asc");
		}
	};

	const sortedData = React.useMemo(() => {
		if (!sortColumn) return fetchedData;

		return [...fetchedData].sort((a, b) => {
			const aValue = a[sortColumn];
			const bValue = b[sortColumn];

			// Handle unknown types by converting to string for comparison
			const aStr = String(aValue);
			const bStr = String(bValue);

			if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
			if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [fetchedData, sortColumn, sortDirection]);

	const totalPages = Math.ceil(sortedData.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Reset to first page when data changes
	useEffect(() => {
		setCurrentPage(1);
	}, [fetchedData]);

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin" />
				<span className="ml-2">Loading...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center">
				<p className="text-red-600 mb-4">
					Error: {error instanceof Error ? error.message : "An error occurred"}
				</p>
				<Button onClick={() => refetch()} variant="outline">
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className={className}>
			<div className="rounded-lg border border-gray-200 bg-white shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="border-b border-gray-200 bg-gray-50/50">
							{columns.map((column) => (
								<TableHead
									key={column.key}
									className={`px-6 py-4 text-left text-sm font-semibold text-gray-900 ${
										column.sortable
											? "cursor-pointer hover:bg-gray-100 transition-colors"
											: ""
									}`}
									onClick={() =>
										column.sortable &&
										handleSort(column.key)
									}
								>
									<div className="flex items-center gap-2">
										{column.header}
										{column.sortable &&
											sortColumn === column.key && (
												<span className="text-xs text-gray-600">
													{sortDirection === "asc"
														? "↑"
														: "↓"}
												</span>
											)}
									</div>
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedData.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="px-6 py-12 text-center text-gray-500"
								>
									No data available
								</TableCell>
							</TableRow>
						) : (
							paginatedData.map((row, index) => (
								<TableRow
									key={startIndex + index}
									className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
								>
									{columns.map((column) => (
										<TableCell
											key={column.key}
											className={`px-6 py-4 text-sm text-gray-900${
												column.key === "mentions"
													? " whitespace-pre-line"
													: ""
											}`}
										>
											{column.accessor(row)}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				{totalPages > 1 && (
					<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
						<div className="text-sm text-gray-600">
							Showing{" "}
							{startIndex + 1} to{" "}
							{Math.min(startIndex + itemsPerPage, sortedData.length)} of{" "}
							{sortedData.length} results
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className="h-8 w-8 p-0"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>

							{Array.from({ length: totalPages }, (_, i) => i + 1)
								.filter((page) => {
									// Show first page, last page, current page, and pages around current
									return (
										page === 1 ||
										page === totalPages ||
										Math.abs(page - currentPage) <= 1
									);
								})
								.map((page, index, visiblePages) => (
									<React.Fragment key={page}>
										{index > 0 &&
											visiblePages[index - 1] < page - 1 && (
												<span className="px-2 text-sm text-gray-500">
													...
												</span>
											)}
										<Button
											variant={currentPage === page ? "default" : "outline"}
											size="sm"
											onClick={() => handlePageChange(page)}
											className="h-8 w-8 p-0"
										>
											{page}
										</Button>
									</React.Fragment>
								))}

							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className="h-8 w-8 p-0"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
