//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Team } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<Team>[] = [
    {
        accessorKey: "ledaId",
        header: "LEDA ID Number",
    },
    {
        accessorKey: "teamName",
        header: "Team Name",
    },
    {
        accessorKey: "memo",
        header: "Description",
    },
    {
        accessorKey: "establishedDate",
        header: "Date Established",
    },
    {
        accessorKey: "lastTeamFeePayment",
        header: "Last Team Fee Payment",
    },
]