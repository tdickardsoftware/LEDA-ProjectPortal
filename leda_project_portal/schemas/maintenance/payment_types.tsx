//
// Use the client
//
"use client"
//
// Imports
//
import { ColumnDef } from "@tanstack/react-table"
import { PaymentType } from "@/lib/definitions"
//
//Define the columns
//
export const columns: ColumnDef<PaymentType>[] = [
    {
        accessorKey: "paymentType",
        header: "Payment Type",
    },
    {
        accessorKey: "desc",
        header: "Description",
    }
]