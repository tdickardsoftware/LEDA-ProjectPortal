/**
 * Column schema for the Payout Tiers data table (Maintenance section).
 * Defines a bulk-selectable checkbox column and columns for finishing place
 * and payout amount.
 */
//
// Use the client
//
"use client";
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table";
import { PayoutTier } from "@/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";
//
//Define the columns
//
export const columns: ColumnDef<PayoutTier>[] = [
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
		accessorKey: "place",
		header: "Place",
	},
	{
		accessorKey: "amount",
		header: "Amount Won",
	},
];
