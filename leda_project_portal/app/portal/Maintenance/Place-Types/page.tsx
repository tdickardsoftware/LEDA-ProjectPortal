import { DataTable } from "@/components/datatable";
import { fetchPlaceTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/place_types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Place Types"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchPlaceTypes()} pageName="Place Types Page" />
            </div>
        </>
    );
}