//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { PeopleType } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<PeopleType>[] = [
    {
        accessorKey: "peopleTypeCode",
        header: "People Type Code",
    },
    {
        accessorKey: "desc",
        header: "Description",
    }
]