import { DataTable } from "@/components/datatable";
import { fetchPlaceTypes, fetchSeasons } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/seasons";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Seasons"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchSeasons()} pageName="Seasons Page" />
            </div>
        </>
    );
}