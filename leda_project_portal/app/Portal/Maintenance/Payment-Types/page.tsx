/**
 * Payment Types maintenance page — server-rendered data table for managing
 * all payment type categories. Supports add, edit, and delete operations.
 */
import { DataTable } from "@/components/datatable";
import { paymentTypeRoute } from "@/lib/apiRoutes";
import { fetchPaymentTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/payment_types";
import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/skeleton";

export const metadata: Metadata = {
	title: "Payment Types",
};

async function PaymentTypesTable() {
	return (
		<div className="container mx-auto py-10">
			<DataTable
				columns={columns}
				data={await fetchPaymentTypes()}
				pageName="Payment Types Page"
				addDialogConfig={{
					form: "PaymentTypeAddForm",
					title: "Add Payment Types",
					buttonName: "Add Payment Type +",
				}}
				deleteDialogConfig={{
					buttonName: "Delete Payment Type(s)",
					title: "Delete Payment Type(s)",
					apiEndpoint: paymentTypeRoute,
				}}
				editDialogConfig={{
					form: "PaymentTypeEditForm",
					title: "Edit Payment Type",
					buttonName: "Edit Payment Type",
				}}
				apiEndpoint={paymentTypeRoute}
			/>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
			<PaymentTypesTable />
		</Suspense>
	);
}
