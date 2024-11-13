import { DataTable } from "@/components/datatable";
import { fetchPeopleTypes } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/people_types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "People Types"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchPeopleTypes()} pageName="People Types Page" />
            </div>
        </>
    );
}