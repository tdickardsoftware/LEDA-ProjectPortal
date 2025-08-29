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
	playerLedaIds,
	placeLedaIds,
	onAddSuccess,
}: {
	playerLedaIds: string[];
	placeLedaIds: string[];
	onAddSuccess?: () => void;
}) {
	const [open, setOpen] = useState(false);

	const playerAlreadySelected = playerLedaIds.length > 0 ? playerLedaIds.join(",") : "";
	const placeAlreadySelected = placeLedaIds.length > 0 ? placeLedaIds.join(",") : "";

	const playerApi = playerAlreadySelected
		? `${playerRoute}/playerMailList?alreadySelected=${playerAlreadySelected}`
		: `${playerRoute}/playerMailList`;

	const placeApi = placeAlreadySelected
		? `${placeRoute}/placeMailList?alreadySelected=${placeAlreadySelected}`
		: `${placeRoute}/placeMailList`;
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
				className="hover:bg-gray-100 border-gray-300 text-gray-700"
				onClick={() => setOpen(true)}
			>
				<Plus className="mr-2 h-4 w-4" />
				Add
			</Button>
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent className="bg-white min-w-[600px]">
					<AlertDialogHeader>
						<AlertDialogTitle>Add Player/Place</AlertDialogTitle>
					</AlertDialogHeader>
					<div className="flex gap-8">
						<div className="flex-1">
							<PopoverMultiSelect
								apiRoute={playerApi}
								label="Players"
								selected={selectedPlayers}
								setSelected={setSelectedPlayers}
								type="PLAYER"
							/>
						</div>
						<div className="flex-1">
							<PopoverMultiSelect
								apiRoute={placeApi}
								label="Places"
								selected={selectedPlaces}
								setSelected={setSelectedPlaces}
								type="PLACE"
							/>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel
							className="hover:bg-gray-100 border-gray-300 text-gray-700"
							disabled={mutation.isPending}
						>
							Cancel
						</AlertDialogCancel>
						<Button
							onClick={handleSave}
							disabled={mutation.isPending || (selectedPlayers.length + selectedPlaces.length === 0)}
							className="hover:bg-gray-100 border-gray-300 text-gray-700"
						>
							{mutation.isPending ? "Saving..." : "Save"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
