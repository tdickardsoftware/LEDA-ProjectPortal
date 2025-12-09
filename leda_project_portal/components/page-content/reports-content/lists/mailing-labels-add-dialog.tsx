import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { playerRoute, placeRoute } from "@/lib/apiRoutes";
import { PopoverMultiSelect } from "@/components/ui/popover-multiselect";
import { MailingList } from "@/lib/definitions";
import { fetchWithSession } from "@/lib/getData";

export default function MailingLabelsAddDialog({
	onAddSuccess,
}: {
	onAddSuccess?: () => void;
}) {
	const [open, setOpen] = useState(false);

	// Use efficient API endpoints that exclude records already in mailing_labels table
	const getPlayerApi = () => `${playerRoute}/playerMailList?availableOnly=true`;
	const getPlaceApi = () => `${placeRoute}/placeMailList?availableOnly=true`;
	const [selectedPlayers, setSelectedPlayers] = useState<MailingList[]>([]);
	const [selectedPlaces, setSelectedPlaces] = useState<MailingList[]>([]);

	const mutation = useMutation({
		mutationFn: async (mailingLabels: MailingList[]) => {
			const res = await fetchWithSession("/api/reports/mailingLabels", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(mailingLabels),
			});
			if (!res.ok) throw new Error("Failed to add mailing labels");
			return res.json();
		},
		onSuccess: () => {
			setOpen(false);
			setSelectedPlayers([]);
			setSelectedPlaces([]);
			if (onAddSuccess) onAddSuccess();
		},
	});

	const handleSave = () => {
		const allSelected = [...selectedPlayers, ...selectedPlaces];
		if (allSelected.length > 0) {
			mutation.mutate(allSelected);
		}
	};

	return (
		<>
			<Button
				variant="outline"
				size="default"
				className="hover:bg-muted border-border text-foreground"
				onClick={() => setOpen(true)}
			>
				<Plus className="mr-2 h-4 w-4" />
				Add
			</Button>
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent className="bg-background min-w-[800px] max-w-[900px]">
					<AlertDialogHeader>
						<AlertDialogTitle>Add Player/Place</AlertDialogTitle>
					</AlertDialogHeader>
					<div className="flex gap-8">
						<div className="flex-1">
							{open && (
								<PopoverMultiSelect
									apiRoute={getPlayerApi()}
									label="Players"
									selected={selectedPlayers}
									setSelected={setSelectedPlayers}
									type="PLAYER"
								/>
							)}
						</div>
						<div className="flex-1">
							{open && (
								<PopoverMultiSelect
									apiRoute={getPlaceApi()}
									label="Places"
									selected={selectedPlaces}
									setSelected={setSelectedPlaces}
									type="PLACE"
								/>
							)}
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel
							className="hover:bg-muted border-border text-foreground"
							disabled={mutation.isPending}
						>
							Cancel
						</AlertDialogCancel>
						<Button variant="outline"
							onClick={handleSave}
							disabled={mutation.isPending || (selectedPlayers.length + selectedPlaces.length === 0)}
							className="hover:bg-muted border-border text-foreground"
						>
							{mutation.isPending ? "Saving..." : "Save"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
