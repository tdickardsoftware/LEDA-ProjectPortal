//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Team } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
//
//Define the columns
//
export const columns: ColumnDef<Team>[] = [
    {
        accessorKey: "ledaId",
        header: ({ column }) => {
            return (
                <Button variant="ghost" 
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    LEDA ID Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "teamName",
        header: ({ column }) => {
            return (
                <Button variant="ghost" 
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Team Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "memo",
        header: ({ column }) => {
            return (
                <Button variant="ghost" 
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "establishedDate",
        header: ({ column }) => {
            return (
                <Button variant="ghost" 
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date Established
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "lastTeamFeePayment",
        header: ({ column }) => {
            return (
                <Button variant="ghost" 
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Last Team Fee Payment
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
]