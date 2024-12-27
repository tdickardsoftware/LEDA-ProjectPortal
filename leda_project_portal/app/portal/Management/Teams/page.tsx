import { DataTable } from "@/components/datatable";
import { DialogWithButton } from "@/components/dialog-button";
import { fetchTeams } from "@/lib/getData";
import { columns } from "@/schemas/managment/teams";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Teams"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchTeams()} pageName="Players Page" addDialog={<DialogWithButton form="Team Add Form" title="Add Team" buttonName="Add Team +"/>} apiEndpoint="/api/teamGet"/>
            </div>
        </>
    );
}