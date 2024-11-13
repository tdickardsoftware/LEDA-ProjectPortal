import { DataTable } from "@/components/datatable";
import { fetchPenalties } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/penalties";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Penalties"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchPenalties()} pageName="Penalties Page" />
            </div>
        </>
    );
}