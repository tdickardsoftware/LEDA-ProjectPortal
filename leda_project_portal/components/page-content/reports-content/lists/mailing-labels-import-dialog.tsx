import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
	const [importBoth, setImportBoth] = useState(false);
	const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

	const mutation = useMutation({
		mutationFn: async () => {
			setStatus("pending");
			if (importBoth) {
				const [playerRes, placeRes] = await Promise.all([
					fetch(`${playerRoute}/playerMailList`, { method: "POST" }),
					fetch(`${placeRoute}/placeMailList`, { method: "POST" }),
				]);
				const bothOk = playerRes.ok && placeRes.ok;
				setStatus(bothOk ? "success" : "error");
				if (!bothOk) throw new Error("Import failed");
				return { player: await playerRes.json(), place: await placeRes.json() };
			} else {
				const url =
					importType === "player"
						? `${playerRoute}/playerMailList`
						: `${placeRoute}/placeMailList`;
				const res = await fetch(url, { method: "POST" });
				setStatus(res.ok ? "success" : "error");
				if (!res.ok) throw new Error("Import failed");
				return res.json();
			}
		},
		onSuccess: () => {
			if (onImportSuccess) onImportSuccess();
		},
		onError: () => {
			setStatus("error");
		},
	});

	const handleImport = () => {
		mutation.mutate();
	};

	return (
		<AlertDialog open={open} onOpenChange={open => {
			onOpenChange(open);
			if (!open) {
				setStatus("idle");
				setImportType(null);
				setImportBoth(false);
			}
		}}>
			<AlertDialogContent className="bg-white">
				<AlertDialogHeader>
					<AlertDialogTitle>Import Mailing Labels</AlertDialogTitle>
					<AlertDialogDescription>
						Select the type of import you want to perform:
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="flex gap-4 my-4 items-center">
					<Button
						variant={importType === "player" ? "default" : "outline"}
						onClick={() => setImportType("player")}
						className="hover:bg-gray-100 border-gray-300 text-gray-700"
						disabled={importBoth}
					>
						Player Import
					</Button>
					<Button
						variant={importType === "place" ? "default" : "outline"}
						onClick={() => setImportType("place")}
						className="hover:bg-gray-100 border-gray-300 text-gray-700"
						disabled={importBoth}
					>
						Place Import
					</Button>
					<div className="flex items-center gap-2 ml-4">
						<Checkbox
							id="import-both-checkbox"
							checked={importBoth}
							onCheckedChange={checked => {
								setImportBoth(!!checked);
								if (checked) setImportType(null);
							}}
						/>
						<label htmlFor="import-both-checkbox" className="text-sm">Import Both</label>
					</div>
				</div>
				{status === "pending" && (
					<div className="text-sm text-gray-500 mb-2">Importing...</div>
				)}
				{status === "success" && (
					<div className="text-sm text-green-600 mb-2">Import successful!</div>
				)}
				{status === "error" && (
					<div className="text-sm text-red-600 mb-2">Import failed. Please try again.</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel
						disabled={status === "pending"}
						className="hover:bg-gray-100 border-gray-300 text-gray-700"
					>
						Cancel
					</AlertDialogCancel>
					<Button
						disabled={(!importType && !importBoth) || status === "pending"}
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
