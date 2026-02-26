/**
 * Column schema for the Trails Dates data table (Activities section).
 * Defines a read-only checkbox select column and the Trails Date display column.
 * The select header is disabled because trails dates are not bulk-editable.
 */
//
// Use the client
//
"use client";
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table";
import { TrailsDate } from "@/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";
//
//Define the columns
//
export const columns: ColumnDef<TrailsDate>[] = [
	{
		id: "select",
		header: () => (
			<Checkbox
				aria-label="Select All"
				disabled
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
		accessorKey: "trailsDate",
		header: "Trails Date",
	},
];
