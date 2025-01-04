import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/add-dialog-button";
import { paymentTypeRoute } from "@/lib/apiRoutes";
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
                <DataTable columns={columns} data={await fetchPaymentTypes()} pageName="Payment Types Page" addDialog={<DialogWithButton form="PaymentTypeAddForm" title="Add Payment Types" buttonName="Add Payment Type +"/>} apiEndpoint={paymentTypeRoute}/>
            </div>
        </>
    );
}