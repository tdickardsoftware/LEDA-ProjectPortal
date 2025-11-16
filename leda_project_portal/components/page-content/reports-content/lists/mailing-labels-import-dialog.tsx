import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { playerRoute, placeRoute } from "@/lib/apiRoutes";
import { fetchWithSession as _fetchWithSession } from "@/lib/getData";

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
	const [progress, setProgress] = useState(0);
	const [importResults, setImportResults] = useState<{ player?: { count: number }; place?: { count: number }; count?: number } | null>(null);

	// Progress bar animation effect
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (status === "pending") {
			setProgress(0);
			interval = setInterval(() => {
				setProgress(prev => {
					if (prev >= 90) return 90; // Stop at 90% until completion
					return prev + Math.random() * 15; // Random increments for realistic feel
				});
			}, 200);
		} else if (status === "success") {
			setProgress(100);
		} else if (status === "error") {
			setProgress(0);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [status]);

	const mutation = useMutation({
		mutationFn: async () => {
			setStatus("pending");
			setProgress(0);
			setImportResults(null);
			
			const timeoutPromise = new Promise<never>((_, reject) => 
				setTimeout(() => reject(new Error('Import timeout after 60 seconds')), 60000)
			);

			if (importBoth) {
				const importPromises = Promise.all([
					_fetchWithSession(`${playerRoute}/playerMailList`, { method: "POST" }),
					_fetchWithSession(`${placeRoute}/placeMailList`, { method: "POST" }),
				]);

				const [playerRes, placeRes] = await Promise.race([
					importPromises,
					timeoutPromise
				]);

				const bothOk = playerRes.ok && placeRes.ok;
				setStatus(bothOk ? "success" : "error");
				if (!bothOk) throw new Error("Import failed");
				
				const results = { 
					player: await playerRes.json(), 
					place: await placeRes.json() 
				};
				setImportResults(results);
				return results;
			} else {
				const url =
					importType === "player"
						? `${playerRoute}/playerMailList`
						: `${placeRoute}/placeMailList`;
						
				const importPromise = _fetchWithSession(url, { method: "POST" });
				const res = await Promise.race([importPromise, timeoutPromise]);
				
				setStatus(res.ok ? "success" : "error");
				if (!res.ok) throw new Error("Import failed");
				
				const results = await res.json();
				setImportResults(results);
				return results;
			}
		},
		onSuccess: () => {
			if (onImportSuccess) onImportSuccess();
		},
		onError: (error) => {
			setStatus("error");
			setProgress(0);
			console.error("Import error:", error);
		},
		retry: false, // Don't retry on timeout/error
	});

	const handleImport = () => {
		setImportResults(null);
		setProgress(0);
		mutation.mutate();
	};

	const handleReset = () => {
		setStatus("idle");
		setProgress(0);
		setImportResults(null);
		mutation.reset();
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
					<div className="space-y-2">
						<div className="text-sm text-gray-500">Importing...</div>
						<Progress value={progress} className="w-full" />
						<div className="text-xs text-gray-400">{Math.round(progress)}%</div>
					</div>
				)}
				{status === "success" && (
					<div className="space-y-2">
						<div className="text-sm text-green-600">Import successful!</div>
						<Progress value={100} className="w-full" />
						{importResults && (
							<div className="text-xs text-gray-600">
								{importBoth ? (
									<>
										Players: {importResults.player?.count || 0} imported, 
										Places: {importResults.place?.count || 0} imported
									</>
								) : (
									<>{importResults.count || 0} records imported</>
								)}
							</div>
						)}
					</div>
				)}
				{status === "error" && (
					<div className="space-y-2">
						<div className="text-sm text-red-600">Import failed. Please try again.</div>
						<Progress value={0} className="w-full" />
					</div>
				)}
				<AlertDialogFooter>
					{status === "success" || status === "error" ? (
						<>
							<AlertDialogCancel
								onClick={handleReset}
								className="hover:bg-gray-100 border-gray-300 text-gray-700"
							>
								Close
							</AlertDialogCancel>
							{status === "error" && (
								<Button
									disabled={(!importType && !importBoth)}
									onClick={handleImport}
									className="hover:bg-gray-100 border-gray-300 text-gray-700"
								>
									Try Again
								</Button>
							)}
						</>
					) : (
						<>
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
						</>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
