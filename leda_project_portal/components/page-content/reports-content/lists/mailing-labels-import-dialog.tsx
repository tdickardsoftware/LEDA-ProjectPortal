import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { playerRoute, placeRoute } from "@/lib/apiRoutes";

type ImportType = "player" | "place";

export default function MailingLabelsImportDialog({
	open,
	onOpenChange,
	onImportSuccess,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onImportSuccess?: () => void;
}) {
	const [importType, setImportType] = useState<ImportType | null>(null);

	const mutation = useMutation({
		mutationFn: async () => {
			const url =
				importType === "player"
					? `${playerRoute}/playerMailList`
					: `${placeRoute}/placeMailList`;
			const res = await fetch(url, { method: "POST" });
			if (!res.ok) throw new Error("Import failed");
			return res.json();
		},
		onSuccess: () => {
			if (onImportSuccess) onImportSuccess();
		},
	});

	const handleImport = () => {
		mutation.mutate();
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="bg-white">
				<AlertDialogHeader>
					<AlertDialogTitle>Import Mailing Labels</AlertDialogTitle>
					<AlertDialogDescription>
						Select the type of import you want to perform:
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="flex gap-4 my-4">
					<Button
						variant={importType === "player" ? "default" : "outline"}
						onClick={() => setImportType("player")}
                        className="hover:bg-gray-100 border-gray-300 text-gray-700"
					>
						Player Import
					</Button>
					<Button
						variant={importType === "place" ? "default" : "outline"}
						onClick={() => setImportType("place")}
                        className="hover:bg-gray-100 border-gray-300 text-gray-700"
					>
						Place Import
					</Button>
				</div>
				{mutation.status === "pending" && (
					<div className="text-sm text-gray-500 mb-2">Importing...</div>
				)}
				{mutation.status === "success" && (
					<div className="text-sm text-green-600 mb-2">Import successful!</div>
				)}
				{mutation.status === "error" && (
					<div className="text-sm text-red-600 mb-2">Import failed. Please try again.</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={mutation.status === "pending"} className="hover:bg-gray-100 border-gray-300 text-gray-700">Cancel</AlertDialogCancel>
					<Button
						disabled={!importType || mutation.status === "pending"}
						onClick={handleImport}
                        className="hover:bg-gray-100 border-gray-300 text-gray-700"
					>
						Import
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
