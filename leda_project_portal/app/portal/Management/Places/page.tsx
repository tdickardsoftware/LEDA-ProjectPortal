import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-button";
import { fetchPlaces } from "@/lib/getData";
import { columns } from "@/schemas/managment/places";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Places"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchPlaces()} pageName="Places Page" addDialog={<DialogWithButton form="PlaceAddForm" title="Add Place" buttonName="Add Place +"/>} apiEndpoint="/api/placeGet"/>
            </div>
        </>
    );
}