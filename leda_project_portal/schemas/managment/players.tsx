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
        accessorKey: "fullName",
        header: "Full Name",
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