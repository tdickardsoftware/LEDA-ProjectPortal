import { DataTable } from "@/components/datatable";
import { fetchPlayers } from "@/lib/data";
import { columns } from "@/schemas/managment/players";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Players"
}

export default async function Page() {
    return (
        <main>
            <h1 className="text-2xl">Players Page</h1>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={await fetchPlayers()} />
            </div>
        </main>
    );
}