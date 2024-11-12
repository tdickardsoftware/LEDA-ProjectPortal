//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Division } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<Division>[] = [
    {
        accessorKey: "divisionName",
        header: "Division",
    }
]