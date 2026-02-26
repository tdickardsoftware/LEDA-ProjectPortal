/**
 * Column schema for the Mentions data table (Maintenance section).
 * Defines a bulk-selectable checkbox column and columns for mention code,
 * description, point value, and mention basis.
 */
//
// Use the client
//
"use client";
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table";
import { Mention } from "@/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";
//
//Define the columns
//
export const columns: ColumnDef<Mention>[] = [
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
		accessorKey: "mentionCode",
		header: "Mention Code",
	},
	{
		accessorKey: "desc",
		header: "Description",
	},
	{
		accessorKey: "points",
		header: "Points",
	},
	{
		accessorKey: "mentionBasis",
		header: "Mention Basis",
	},
];
