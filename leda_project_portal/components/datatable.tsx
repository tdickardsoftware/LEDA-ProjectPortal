'use client';

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

interface DataTableProps<TData extends Record<string,unknown>, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageName: string;
}

export function DataTable<TData extends Record<string, unknown>, TValue>({
    columns,
    data,
    pageName,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [searchQuery, setSearchQuery] = React.useState(""); // State for search input
    const [debouncedQuery, setDebouncedQuery] = React.useState(""); // State for debounced query
      // Debounce the search input
    React.useEffect(() => {
        const handler = setTimeout(() => {
        setDebouncedQuery(searchQuery);
        }, 300); // Update after 300ms of inactivity

        return () => clearTimeout(handler); // Cleanup on each change
    }, [searchQuery]);

    // Filtered data based on debounced query
    const filteredData = React.useMemo(() => {
        if (!debouncedQuery) return data;
        return data.filter((row) =>
        Object.values(row).some((value) =>
            String(value).toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        );
    }, [debouncedQuery, data]);

    const table = useReactTable({
        data: filteredData, // Use filtered data here
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 shadow-lg bg-white rounded-lg border border-gray-200 w-full max-w-4xl">
            <div className="overflow-hidden rounded-md">
            <h1 className="text-3xl pb-4 text-center">{pageName}</h1>

            {/* Search Input */}
            <div className="mb-4">
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
                                header.column.columnDef.header,
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
                        data-state={row.getIsSelected() && "selected"}
                    >
                        {row.getVisibleCells().map((cell) => (
                        <TableCell
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
