"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(apiRoute);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			const fetchedData = result.data || result;
			setData(fetchedData);

			// Call the callback if provided
			if (onDataFetch) {
				onDataFetch(fetchedData);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [apiRoute, onDataFetch]); // Remove onDataFetch from dependencies

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSort = (columnKey: string) => {
		if (sortColumn === columnKey) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(columnKey);
			setSortDirection("asc");
		}
	};

	const sortedData = React.useMemo(() => {
		if (!sortColumn) return data;

		return [...data].sort((a, b) => {
			const aValue = a[sortColumn];
			const bValue = b[sortColumn];

			// Handle unknown types by converting to string for comparison
			const aStr = String(aValue);
			const bStr = String(bValue);

			if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
			if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [data, sortColumn, sortDirection]);

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
				<p className="text-red-600 mb-4">Error: {error}</p>
				<Button onClick={fetchData} variant="outline">
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
						{sortedData.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="px-6 py-12 text-center text-gray-500"
								>
									No data available
								</TableCell>
							</TableRow>
						) : (
							sortedData.map((row, index) => (
								<TableRow
									key={index}
									className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
								>
									{columns.map((column) => (
										<TableCell
											key={column.key}
											className="px-6 py-4 text-sm text-gray-900"
										>
											{column.accessor(row)}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
