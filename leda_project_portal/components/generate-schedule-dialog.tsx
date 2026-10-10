"use client";

/**
 * GenerateScheduleDialog
 *
 * Auto-generates a round-robin schedule for every subdivision in the season.
 *
 * Generating wipes all existing season data (schedule, scoresheets, points,
 * mentions, penalties, payouts) after a window.confirm prompt.
 *
 * Every subdivision's matchups are always confined to that subdivision —
 * teams never receive opponents from outside their own subdivision.
 *
 * Uses the circle-method round-robin algorithm from lib/scheduleGenerator.ts.
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Wand2, AlertTriangle, CheckCircle2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { DivisionsData, ScheduleData } from "@/lib/schedule";
import {
	generateSchedule,
	type GenerateScope,
	type GeneratorOptions,
	type GenerationPreview,
} from "@/lib/scheduleGenerator";
import { wipeSeasonData } from "@/lib/getData";

const ALL_DIVISIONS: GenerateScope = { type: "all" };

interface GenerateScheduleDialogProps {
	divisionsData: DivisionsData;
	gameDates: Record<string, string>;
	seasonCode: string | null;
	disabled?: boolean;
	onGenerate: (data: ScheduleData) => void | Promise<void>;
	/** Controlled mode: the caller opens/closes the dialog and no trigger button is rendered. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** When set, dismissing the dialog without generating asks the user to confirm with this message. */
	closeWarning?: string;
}

export default function GenerateScheduleDialog({
	divisionsData,
	gameDates,
	seasonCode,
	disabled = false,
	onGenerate,
	open: openProp,
	onOpenChange,
	closeWarning,
}: GenerateScheduleDialogProps) {
	const [innerOpen, setInnerOpen] = useState(false);
	const controlled = openProp !== undefined;
	const open = controlled ? openProp : innerOpen;
	const setOpen = controlled ? (v: boolean) => onOpenChange?.(v) : setInnerOpen;
	const [matchTime, setMatchTime] = useState("19:30");
	const [useDifferentLayout, setUseDifferentLayout] = useState(false);
	const [variationSeed, setVariationSeed] = useState(1);
	const [useSequentialPairing, setUseSequentialPairing] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);

	const divisionNames = useMemo(() => Object.keys(divisionsData), [divisionsData]);

	// Sorted game date entries: [weekKey, dateString][] ascending by week number
	const gameDateEntries = useMemo<[string, string][]>(
		() =>
			Object.entries(gameDates)
				.map(([key, date]) => {
					const num = parseInt(key.match(/\d+/)?.[0] ?? "1", 10);
					return { weekKey: `week${num}`, date, num };
				})
				.sort((a, b) => a.num - b.num)
				.map(({ weekKey, date }) => [weekKey, date] as [string, string]),
		[gameDates]
	);

	const generatorOptions = useMemo<GeneratorOptions>(() => ({
		defaultMatchTime: matchTime,
		skipFilledWeeks: false,
		rotationOffset: useDifferentLayout ? variationSeed : 0,
		shuffleSeed: useDifferentLayout ? variationSeed : undefined,
		sequentialPairing: useSequentialPairing || undefined,
	}), [matchTime, useDifferentLayout, variationSeed, useSequentialPairing]);

	// Live preview — recalculates whenever settings change
	const preview = useMemo<GenerationPreview[]>(() => {
		if (!divisionNames.length || !gameDateEntries.length) return [];
		const { preview } = generateSchedule(ALL_DIVISIONS, divisionsData, gameDateEntries, {}, generatorOptions);
		return preview;
	}, [divisionsData, gameDateEntries, generatorOptions, divisionNames.length]);

	// Rough total matchup count (excludes BYE entries)
	const totalMatchups = useMemo(
		() =>
			preview.reduce(
				(sum, p) =>
					sum + p.weeksAvailable * Math.floor(p.teamCount / 2),
				0
			),
		[preview]
	);

	const hasWarnings = preview.some((p) => !!p.warning);
	const canGenerate =
		!isGenerating && !!seasonCode && preview.length > 0 && preview.some((p) => p.teamCount >= 2);

	const handleGenerate = useCallback(async () => {
		if (!seasonCode) return;
		if (
			!window.confirm(
				`Generating the schedule will permanently delete ALL existing data for season ${seasonCode} (schedule, scoresheets, points, mentions, penalties and payouts). The schedule will then be regenerated from the roster. This cannot be undone. Continue?`
			)
		) {
			return;
		}
		setIsGenerating(true);
		try {
			await wipeSeasonData(seasonCode);
			const { data } = generateSchedule(
				ALL_DIVISIONS,
				divisionsData,
				gameDateEntries,
				{},
				generatorOptions
			);
			await onGenerate(data);
			setOpen(false);
		} catch (error) {
			console.error("Failed to generate schedule:", error);
			toast.error("Failed to generate schedule");
		} finally {
			setIsGenerating(false);
		}
	}, [seasonCode, divisionsData, gameDateEntries, generatorOptions, onGenerate]);

	const handleTryAnotherLayout = useCallback(() => {
		setUseDifferentLayout(true);
		setVariationSeed((current) => current + 1);
	}, []);

	// Reset settings each time the dialog opens
	useEffect(() => {
		if (open) {
			setMatchTime("19:30");
			setUseDifferentLayout(false);
			setVariationSeed(1);
			setUseSequentialPairing(true);
		}
	}, [open]);

	// Dismissals (Cancel, Esc, click outside) go through the optional close warning
	const handleOpenChange = (val: boolean) => {
		if (!val && closeWarning && !window.confirm(closeWarning)) return;
		setOpen(val);
	};

	// Browser-level warning for reloads/tab closes while the dialog is pending
	useEffect(() => {
		if (!open || !closeWarning || isGenerating) return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [open, closeWarning, isGenerating]);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{!controlled && (
				<DialogTrigger asChild>
					<Button
						variant="outline"
						className="hover:bg-muted border-border text-foreground"
						disabled={disabled}
					>
						<Wand2 className="mr-2 h-4 w-4" />
						Generate Schedule
					</Button>
				</DialogTrigger>
			)}

			<DialogContent className="bg-background sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Auto-Generate Schedule</DialogTitle>
					<DialogDescription>
						Generates a round-robin schedule that fills every available game week.
						When there are more weeks than one round-robin cycle, matchups repeat in a
						new cycle. Teams are never matched outside their own subdivision.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 pt-1">
					{/* ── Match time ────────────────────────────────────────── */}
					<div className="flex items-center gap-3">
						<Label className="text-sm w-36 shrink-0">Default Match Time</Label>
						<Input
							type="time"
							value={matchTime}
							onChange={(e) => setMatchTime(e.target.value)}
							className="w-36"
						/>
					</div>

					<div className="flex items-center gap-3 flex-wrap">
						<Checkbox
							id="different-layout"
							checked={useDifferentLayout}
							onCheckedChange={(value) => setUseDifferentLayout(value === true)}
						/>
						<Label htmlFor="different-layout" className="text-sm cursor-pointer">
							Generate a different matchup layout
						</Label>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleTryAnotherLayout}
							className="border-border text-foreground hover:bg-muted"
						>
							Try Another Layout
						</Button>
						{useDifferentLayout && (
							<span className="text-xs text-muted-foreground">
								Variation {variationSeed}
							</span>
						)}
					</div>

				{/* ── Sequential pairing (legacy LEDA pattern) ──────────── */}
				<div className="flex items-center gap-3">
					<Checkbox
						id="sequential-pairing"
						checked={useSequentialPairing}
						onCheckedChange={(v) => setUseSequentialPairing(v === true)}
					/>
					<Label htmlFor="sequential-pairing" className="text-sm cursor-pointer">
						Use legacy LEDA pairing pattern
					</Label>
				</div>

					{/* ── Preview table ─────────────────────────────────────── */}
					{preview.length > 0 && (
						<div className="space-y-2">
							<Label className="text-sm font-medium">Preview</Label>
							<div className="rounded-md border border-border overflow-hidden">
								<table className="w-full text-sm">
									<thead>
										<tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
											<th className="text-left px-3 py-2 font-medium">
												Division
											</th>
											<th className="text-left px-3 py-2 font-medium">
												Subdivision
											</th>
											<th className="text-center px-3 py-2 font-medium">
												Teams
											</th>
											<th className="text-center px-3 py-2 font-medium">
												Rounds / Cycle
											</th>
											<th className="text-center px-3 py-2 font-medium">
												Weeks
											</th>
											<th className="text-center px-3 py-2 font-medium">
												Status
											</th>
										</tr>
									</thead>
									<tbody>
										{preview.map((p, i) => (
											<tr
												key={i}
												className="border-t border-border hover:bg-muted/30"
											>
												<td className="px-3 py-2">{p.division}</td>
												<td className="px-3 py-2">{p.subdivision}</td>
												<td className="px-3 py-2 text-center">
													{p.teamCount}
												</td>
												<td className="px-3 py-2 text-center">
													{p.roundsPerCycle}
												</td>
												<td className="px-3 py-2 text-center">
													{p.weeksAvailable}
												</td>
												<td className="px-3 py-2 text-center">
													{p.teamCount < 2 ? (
														<span
															className="text-xs text-muted-foreground"
															title="Need at least 2 teams"
														>
															—
														</span>
													) : p.warning ? (
																<span title={p.warning} className="inline-flex">
																	<TriangleAlert className="h-4 w-4 text-yellow-500 mx-auto" />
																</span>
													) : (
														<CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Warning details */}
							{hasWarnings && (
								<div className="space-y-1">
									{preview
										.filter((p) => p.warning)
										.map((p, i) => (
											<p
												key={i}
												className="text-xs text-yellow-600 dark:text-yellow-400 flex items-start gap-1"
											>
												<TriangleAlert className="h-3 w-3 mt-0.5 shrink-0" />
												<span>
													<span className="font-medium">
														{p.division} › {p.subdivision}:
													</span>{" "}
													{p.warning}
												</span>
											</p>
										))}
								</div>
							)}

							<p className="text-xs text-muted-foreground">
								Approximately{" "}
								<span className="font-medium text-foreground">
									{totalMatchups}
								</span>{" "}
								matchup{totalMatchups !== 1 ? "s" : ""} will be created.
							</p>
						</div>
					)}

					{/* ── Overwrite warning ─────────────────────────────────── */}
					<div className="flex gap-2 rounded-md border border-yellow-500 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
						<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
						<span>
							All existing data for this season (schedule, scoresheets, points,
							mentions, penalties and payouts) will be permanently deleted.
						</span>
					</div>
				</div>

				<DialogFooter className="mt-2">
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						className="border-border text-foreground hover:bg-muted"
					>
						Cancel
					</Button>
					<Button onClick={handleGenerate} disabled={!canGenerate}>
						{isGenerating ? "Generating…" : "Generate"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
