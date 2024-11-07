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
        accessorKey: "addressOne",
        header: "Address One",
    },
    {
        accessorKey: "addressTwo",
        header: "Address Two",
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "state",
        header: "State",
    },
    {
        accessorKey: "zip",
        header: "Zip Code",
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
    },
    {
        accessorKey: "otherNumber",
        header: "Other Number",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "gender",
        header: "Gender",
    },
    {
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
    },
]