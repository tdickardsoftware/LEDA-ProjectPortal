import { DataTable } from "@/components/datatable";
import { fetchDivisions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/divisions";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Divisions"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchDivisions()} pageName="Divisions Page" />
            </div>
        </>
    );
}