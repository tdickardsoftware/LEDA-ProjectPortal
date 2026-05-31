"use client";

/**
 * GenerateScheduleDialog
 *
 * Allows league administrators to auto-generate a round-robin schedule for:
 *  - The currently selected subdivision
 *  - An entire division (all of its subdivisions)
 *  - All divisions at once
 *
 * Every subdivision's matchups are always confined to that subdivision —
 * teams never receive opponents from outside their own subdivision.
 *
 * Uses the circle-method round-robin algorithm from lib/scheduleGenerator.ts.
 */

import React, { useState, useMemo, useCallback } from "react";
import { Wand2, AlertTriangle, CheckCircle2, TriangleAlert } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import type { DivisionsData, ScheduleData, ScheduleApiResponse } from "@/lib/schedule";
import {
	generateSchedule,
	type GenerateScope,
	type GeneratorOptions,
	type GenerationPreview,
} from "@/lib/scheduleGenerator";
import { scheduleRoute } from "@/lib/apiRoutes";

type ScopeType = "subdivision" | "division" | "all";

interface GenerateScheduleDialogProps {
	divisionsData: DivisionsData;
	gameDates: Record<string, string>;
	currentSubdivision: { divisionName: string; subdivisionName: string } | null;
	seasonCode: string | null;
	disabled?: boolean;
	onGenerate: (data: ScheduleData) => void;
}

export default function GenerateScheduleDialog({
	divisionsData,
	gameDates,
	currentSubdivision,
	seasonCode,
	disabled = false,
	onGenerate,
}: GenerateScheduleDialogProps) {
	const [open, setOpen] = useState(false);
	const [scopeType, setScopeType] = useState<ScopeType>("all");
	const [selectedDivision, setSelectedDivision] = useState<string>("");
	const [matchTime, setMatchTime] = useState("19:30");
	const [skipFilled, setSkipFilled] = useState(false);
	const [useDifferentLayout, setUseDifferentLayout] = useState(false);
	const [variationSeed, setVariationSeed] = useState(1);
	const [isGenerating, setIsGenerating] = useState(false);

	const divisionNames = useMemo(() => Object.keys(divisionsData), [divisionsData]);

	// Subdivisions available under the currently selected division
	const subdivisionNames = useMemo(
		() =>
			selectedDivision
				? Object.keys(divisionsData[selectedDivision]?.subdivisions ?? {})
				: [],
		[divisionsData, selectedDivision]
	);

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

	// Fetch existing schedule data when the "skip filled weeks" option is enabled.
	// This lets the generator leave already-scheduled weeks untouched.
	const { data: existingScheduleData, isLoading: isLoadingExisting } =
		useQuery<ScheduleApiResponse>({
			queryKey: ["schedule", seasonCode],
			queryFn: async () => {
				const res = await fetch(
					`${scheduleRoute}?seasonCode=${encodeURIComponent(seasonCode ?? "")}`
				);
				if (res.status === 404) return { scheduleData: {} };
				if (!res.ok) throw new Error("Failed to fetch existing schedule");
				return res.json();
			},
			enabled: open && !!seasonCode && skipFilled,
			staleTime: 30_000,
		});

	const existingData: ScheduleData = existingScheduleData?.scheduleData ?? {};

	const generatorOptions = useMemo<GeneratorOptions>(() => ({
		defaultMatchTime: matchTime,
		skipFilledWeeks: skipFilled,
		rotationOffset: useDifferentLayout ? variationSeed : 0,
		shuffleSeed: useDifferentLayout ? variationSeed : undefined,
	}), [matchTime, skipFilled, useDifferentLayout, variationSeed]);

	// Resolved scope object consumed by the generator
	const scope = useMemo<GenerateScope>(() => {
		if (scopeType === "subdivision" && currentSubdivision) {
			return {
				type: "subdivision",
				division: currentSubdivision.divisionName,
				subdivision: currentSubdivision.subdivisionName,
			};
		}
		if (scopeType === "division" && selectedDivision) {
			return { type: "division", division: selectedDivision };
		}
		return { type: "all" };
	}, [scopeType, currentSubdivision, selectedDivision]);

	// Live preview — recalculates whenever scope or settings change
	const preview = useMemo<GenerationPreview[]>(() => {
		if (!divisionNames.length || !gameDateEntries.length) return [];
		const { preview } = generateSchedule(scope, divisionsData, gameDateEntries, existingData, generatorOptions);
		return preview;
	}, [scope, divisionsData, gameDateEntries, existingData, generatorOptions, divisionNames.length]);

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
		!isGenerating && preview.length > 0 && preview.some((p) => p.teamCount >= 2);

	const handleGenerate = useCallback(async () => {
		setIsGenerating(true);
		try {
			const { data } = generateSchedule(
				scope,
				divisionsData,
				gameDateEntries,
				existingData,
				generatorOptions
			);
			console.log("[Schedule] Generated draft data", {
				scope,
				options: generatorOptions,
				data,
			});
			onGenerate(data);
			setOpen(false);
		} catch {
			// generation error is surfaced via the save-status indicator
		} finally {
			setIsGenerating(false);
		}
	}, [scope, divisionsData, gameDateEntries, existingData, generatorOptions, onGenerate]);

	const handleTryAnotherLayout = useCallback(() => {
		setUseDifferentLayout(true);
		setVariationSeed((current) => current + 1);
	}, []);

	// When the dialog opens, synchronise state with the current page selection
	const handleOpenChange = useCallback(
		(val: boolean) => {
			if (val) {
				const defaultScope: ScopeType = currentSubdivision
					? "subdivision"
					: "all";
				setScopeType(defaultScope);
				setSelectedDivision(
					currentSubdivision?.divisionName ?? divisionNames[0] ?? ""
				);
				setMatchTime("19:30");
				setSkipFilled(false);
				setUseDifferentLayout(false);
				setVariationSeed(1);
			}
			setOpen(val);
		},
		[currentSubdivision, divisionNames]
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
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
					{/* ── Scope ─────────────────────────────────────────────── */}
					<div className="space-y-2">
						<Label className="text-sm font-medium">Generate for</Label>
						<div className="flex flex-wrap gap-2">
							<Button
								size="sm"
								variant={scopeType === "subdivision" ? "default" : "outline"}
								disabled={!currentSubdivision}
								onClick={() => setScopeType("subdivision")}
								className={
									scopeType !== "subdivision"
										? "border-border text-foreground hover:bg-muted"
										: ""
								}
							>
								Current Subdivision
							</Button>
							<Button
								size="sm"
								variant={scopeType === "division" ? "default" : "outline"}
								onClick={() => setScopeType("division")}
								className={
									scopeType !== "division"
										? "border-border text-foreground hover:bg-muted"
										: ""
								}
							>
								Division
							</Button>
							<Button
								size="sm"
								variant={scopeType === "all" ? "default" : "outline"}
								onClick={() => setScopeType("all")}
								className={
									scopeType !== "all"
										? "border-border text-foreground hover:bg-muted"
										: ""
								}
							>
								All Divisions
							</Button>
						</div>

						{/* Subdivision scope: display current selection as read-only */}
						{scopeType === "subdivision" && currentSubdivision && (
							<p className="text-sm text-muted-foreground pl-1">
								<span className="font-medium text-foreground">
									{currentSubdivision.divisionName}
								</span>
								{" › "}
								<span className="font-medium text-foreground">
									{currentSubdivision.subdivisionName}
								</span>
							</p>
						)}

						{/* Division scope: pick which division */}
						{scopeType === "division" && (
							<div className="flex items-center gap-3 pl-1">
								<Label className="text-sm shrink-0">Division</Label>
								<Select
									value={selectedDivision}
									onValueChange={setSelectedDivision}
								>
									<SelectTrigger className="w-[220px]">
										<SelectValue placeholder="Select division…" />
									</SelectTrigger>
									<SelectContent>
										{divisionNames.map((d) => (
											<SelectItem key={d} value={d}>
												{d}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

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

					{/* ── Preserve-existing toggle ─────────────────────────── */}
					<div className="flex items-center gap-3">
						<Checkbox
							id="preserve-existing"
							checked={skipFilled}
							onCheckedChange={(v) => setSkipFilled(v === true)}
						/>
						<Label htmlFor="preserve-existing" className="text-sm cursor-pointer">
							Preserve existing matchups
						</Label>
						{skipFilled && isLoadingExisting && (
							<span className="text-xs text-muted-foreground">Loading…</span>
						)}
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
												Preserved
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
													{p.preservedWeeks}
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
														<TriangleAlert
															className="h-4 w-4 text-yellow-500 mx-auto"
															title={p.warning}
														/>
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
					{!skipFilled && (
						<div className="flex gap-2 rounded-md border border-yellow-500 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
							<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
							<span>
								Existing matchups in the selected scope will be replaced.
								Matchups with logged scoresheet points may be affected.
							</span>
						</div>
					)}
				</div>

				<DialogFooter className="mt-2">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
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
