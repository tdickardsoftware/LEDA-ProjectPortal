import { Check, Loader2, AlertCircle } from "lucide-react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
	if (status === "idle") return null;
	if (status === "pending")
		return <span className="text-xs text-muted-foreground">Unsaved changes...</span>;
	if (status === "saving")
		return (
			<span className="flex items-center gap-1 text-xs text-muted-foreground">
				<Loader2 className="h-3 w-3 animate-spin" /> Saving...
			</span>
		);
	if (status === "saved")
		return (
			<span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
				<Check className="h-3 w-3" /> Saved
			</span>
		);
	if (status === "error")
		return (
			<span className="flex items-center gap-1 text-xs text-destructive">
				<AlertCircle className="h-3 w-3" /> Save failed
			</span>
		);
	return null;
}
