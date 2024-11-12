//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { PayoutTier } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<PayoutTier>[] = [
    {
        accessorKey: "place",
        header: "Place",
    },
    {
        accessorKey: "amount",
        header: "Amount Won",
    }
]