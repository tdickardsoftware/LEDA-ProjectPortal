/**
 * PlaceCapacityBadge
 *
 * Small reusable badge showing how many teams are currently assigned to a
 * place relative to its total number of boards (e.g. "3/8 boards"). Color
 * codes the badge so callers can spot over-capacity places at a glance:
 *  - destructive (red)  when assigned > capacity
 *  - yellow             when assigned === capacity (full)
 *  - muted              otherwise
 *
 * When `assigned` is omitted, renders a plain "N boards" total with no
 * ratio/color-coding — use this when there's no assignment count to compare
 * against (e.g. a season's backup location, which isn't roster-assigned).
 *
 * Used anywhere a place is selected or displayed (roster team assignment,
 * place detail views, etc.) so the "boards used" concept stays consistent.
 */
"use client";

import { cn } from "@/lib/utils";

export function PlaceCapacityBadge({
	assigned,
	capacity,
	className,
}: {
	assigned?: number;
	capacity: number;
	className?: string;
}) {
	if (assigned === undefined) {
		return (
			<span
				className={cn(
					"whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground",
					className
				)}
				title={`${capacity} board${capacity === 1 ? "" : "s"} total`}
			>
				{capacity} board{capacity === 1 ? "" : "s"}
			</span>
		);
	}

	const over = assigned > capacity;
	const atCapacity = !over && capacity > 0 && assigned === capacity;

	return (
		<span
			className={cn(
				"whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium",
				over
					? "bg-destructive/10 text-destructive"
					: atCapacity
					? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
					: "bg-muted text-muted-foreground",
				className
			)}
			title={
				over
					? `${assigned} teams assigned but only ${capacity} boards available`
					: `${assigned} of ${capacity} boards assigned`
			}
		>
			{assigned}/{capacity} boards
		</span>
	);
}
