import { DataTable } from "@/components/datatable";
import { fetchMentions } from "@/lib/getData";
import { columns } from "@/schemas/maintenance/mentions";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mentions"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchMentions()} pageName="Mentions Page" />
            </div>
        </>
    );
}