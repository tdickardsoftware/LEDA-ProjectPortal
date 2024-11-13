//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { PlaceType } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<PlaceType>[] = [
    {
        accessorKey: "placeTypeCode",
        header: "Place Type Code",
    },
    {
        accessorKey: "desc",
        header: "Description",
    }
]