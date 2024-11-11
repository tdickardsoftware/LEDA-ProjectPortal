//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { Place } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<Place>[] = [
    {
        accessorKey: "ledaId",
        header: "LEDA ID Number",
    },
    {
        accessorKey: "name",
        header: "Place Name",
    },
    {
        accessorKey: "addressFull",
        header: "Address",
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
    },
    {
        accessorKey: "placeType",
        header: "Place Type"
    }
]