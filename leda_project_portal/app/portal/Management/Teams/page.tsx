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
                <DataTable columns={columns} data={await fetchTeams()} pageName="Teams Page" addDialog={<DialogWithButton form="TeamAddForm" title="Add Team" buttonName="Add Team +"/>} apiEndpoint="/api/team/teamGet"/>
            </div>
        </>
    );
}