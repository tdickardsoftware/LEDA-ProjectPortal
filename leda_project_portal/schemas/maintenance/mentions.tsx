//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Mention } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<Mention>[] = [
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
]