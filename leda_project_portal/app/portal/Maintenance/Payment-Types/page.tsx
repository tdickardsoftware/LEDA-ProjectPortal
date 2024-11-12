import { DataTable } from "@/components/datatable";
import { fetchPaymentTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/payment_types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payment Types"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchPaymentTypes()} pageName="Payment Types Page" />
            </div>
        </>
    );
}