//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Player } from "@/lib/definitions"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
//
//Define the columns
//
export const columns: ColumnDef<Player>[] = [
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
        accessorKey: "fullName",
        header: ({ column }) => {
            return (
                <Button variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Full Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "phoneNumberFormatted",
        header: ({ column }) => {
            return (
                <Button variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Phone Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
]