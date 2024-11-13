//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Season } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<Season>[] = [
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
]