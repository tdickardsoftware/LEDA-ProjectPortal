//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Player } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<Player>[] = [
    {
        accessorKey: "ledaId",
        header: "LEDA ID Number",
    },
    {
        accessorKey: "lastName",
        header: "Last Name",
    },
    {
        accessorKey: "firstName",
        header: "First Name",
    },
    {
        accessorKey: "middleInitial",
        header: "Middle Initial",
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
]