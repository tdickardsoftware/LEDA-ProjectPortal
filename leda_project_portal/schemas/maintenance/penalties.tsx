//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Penalty } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<Penalty>[] = [
    {
        accessorKey: "penaltyCode",
        header: "Penalty Code",
    },
    {
        accessorKey: "desc",
        header: "Description",
    }
]