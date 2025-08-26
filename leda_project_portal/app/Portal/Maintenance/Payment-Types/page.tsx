import { DataTable } from "@/components/datatable";
import { paymentTypeRoute } from "@/lib/apiRoutes";
import { fetchPaymentTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/payment_types";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Payment Types",
};

export const dynamic = "force-dynamic";

export default async function Page() {
	return (
		<>
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
		</>
	);
}
