import { DataTable } from "@/components/datatable";
import { PlayerAddInformationForm } from "@/components/player-info-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { fetchPlayers } from "@/lib/getData";
import { columns } from "@/schemas/managment/players";
import { DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Players"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="default">Add Player +</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Player Form</DialogTitle>
                            <DialogDescription>Add a player</DialogDescription>
                        </DialogHeader>
                        <PlayerAddInformationForm />
                    </DialogContent>
                </Dialog>
                <DataTable columns={columns} data={await fetchPlayers()} pageName="Players Page" />
            </div>
        </>
    );
}