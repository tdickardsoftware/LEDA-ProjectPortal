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
