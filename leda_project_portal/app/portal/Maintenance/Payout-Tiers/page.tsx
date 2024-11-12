import { DataTable } from "@/components/datatable";
import { fetchPayoutTiers } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/payout_tiers";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payout Tiers"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchPayoutTiers()} pageName="Payout Tiers Page" />
            </div>
        </>
    );
}