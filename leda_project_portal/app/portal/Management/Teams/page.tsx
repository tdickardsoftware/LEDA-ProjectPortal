import { DataTable } from "@/components/datatable";
import { fetchTeams } from "@/lib/data";
import { columns } from "@/schemas/managment/teams";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Teams"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchTeams()} pageName="Teams Page" />
            </div>
        </>
    );
}