/**
 * Column schema for the Seasons data table (Maintenance section).
 * Defines a bulk-selectable checkbox column and columns for season code,
 * description, fiscal year, and current-season flag.
 */
//
// Use the client
//
"use client";
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table";
import { SeasonDataTable } from "@/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";
//
//Define the columns
//
export const columns: ColumnDef<SeasonDataTable>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label="Select All"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select Row"
			/>
		),
	},
	{
		accessorKey: "seasonCode",
		header: "Season Code",
	},
	{
		accessorKey: "desc",
		header: "Description",
	},
	{
		accessorKey: "fiscalYear",
		header: "Fiscal Year",
	},
	{
		accessorKey: "isCurrentSeason",
		header: "Current Season",
	},
];
