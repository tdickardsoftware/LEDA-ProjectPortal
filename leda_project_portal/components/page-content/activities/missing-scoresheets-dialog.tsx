"use client";

/**
 * MissingScoresheetsDialog
 *
 * Opens a dialog showing all matchups that are missing or incomplete for the
 * selected season + week.  Matchups are grouped into collapsible division >
 * subdivision accordions.  Clicking a matchup row calls handleMatchupSelection
 * to load it in the parent scoresheet editor.
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { fetchWithSession } from "@/lib/getData";

interface MissingScoresheet {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: string;
	teamAId: string;
	teamBId: string;
	issueType: string;
}

interface MissingScoresheetsDialogProps {
	seasonCode: string;
	weekNum: string;
	handleMatchupSelection: (
		homeLetter: string,
		awayLetter: string,
		divisionName: string,
		subdivisionName: string
	) => void;
	disabled?: boolean;
}

export default function MissingScoresheetsDialog({
	seasonCode,
	weekNum,
	handleMatchupSelection,
	disabled,
}: MissingScoresheetsDialogProps) {
	const [open, setOpen] = useState(false);
	const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>({});
	const [openSubdivisions, setOpenSubdivisions] = useState<Record<string, boolean>>({});

	// teamId → letter per subdivision key "division|||subdivision"
	const [letterMap, setLetterMap] = useState<Record<string, Record<string, string>>>({});

	// Reset accordion state whenever dialog opens for a different week
	useEffect(() => {
		if (!open) return;
		setOpenDivisions({});
		setOpenSubdivisions({});
		setLetterMap({});
	}, [open, seasonCode, weekNum]);

	const { data: rows, isLoading } = useQuery<MissingScoresheet[]>({
		queryKey: ["missingScoresheets", seasonCode, weekNum],
		queryFn: async () => {
			if (!seasonCode || !weekNum) return [];
			const res = await fetchWithSession(
				`/api/activities/scoresheets/missingScoresheetsCheck?seasonCode=${encodeURIComponent(
					seasonCode
				)}&weekNum=${encodeURIComponent(weekNum)}`,
				{ method: "GET" }
			);
			if (res.status === 204) return [];
			if (!res.ok) return [];
			return res.json();
		},
		enabled: !!seasonCode && !!weekNum && open,
		staleTime: 1000 * 60 * 2,
	});

	// When results arrive, pre-open all divisions/subdivisions and fetch letter maps
	useEffect(() => {
		if (!rows || rows.length === 0) return;

		const divOpen: Record<string, boolean> = {};
		const subdivOpen: Record<string, boolean> = {};
		const uniqueSubdivs = new Set<string>();

		for (const row of rows) {
			divOpen[row.division] = true;
			const subdivKey = `${row.division}-${row.subdivision}`;
			subdivOpen[subdivKey] = true;
			uniqueSubdivs.add(`${row.division}|||${row.subdivision}`);
		}

		setOpenDivisions(divOpen);
		setOpenSubdivisions(subdivOpen);

		// Fetch schedule subdivision data to resolve teamId → letter
		uniqueSubdivs.forEach(async (key) => {
			const [division, subdivision] = key.split("|||");
			try {
				const res = await fetchWithSession(
					`/api/activities/schedule/subdivision?seasonCode=${encodeURIComponent(
						seasonCode
					)}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(
						subdivision
					)}`,
					{ method: "GET" }
				);
				if (!res.ok) return;
				const data = await res.json();
				const subdivData: Record<string, { teamId?: string }> | undefined =
					data?.scheduleData?.[division]?.[subdivision];
				if (!subdivData) return;
				// Build teamId → letter reverse map for this subdivision
				const reverseMap: Record<string, string> = {};
				for (const [letter, info] of Object.entries(subdivData)) {
					if (info?.teamId) reverseMap[String(info.teamId)] = letter;
				}
				setLetterMap((prev) => ({ ...prev, [key]: reverseMap }));
			} catch {
				// ignore; matchup rows will fall back to showing IDs
			}
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rows]);

	// Group rows by division → subdivision
	const grouped: Record<string, Record<string, MissingScoresheet[]>> = {};
	for (const row of rows ?? []) {
		if (!grouped[row.division]) grouped[row.division] = {};
		if (!grouped[row.division][row.subdivision])
			grouped[row.division][row.subdivision] = [];
		grouped[row.division][row.subdivision].push(row);
	}

	const resolveLetters = (
		division: string,
		subdivision: string,
		teamAId: string,
		teamBId: string
	): { letterA: string; letterB: string } => {
		const key = `${division}|||${subdivision}`;
		const map = letterMap[key] ?? {};
		return {
			letterA: map[String(teamAId)] ?? `#${teamAId}`,
			letterB: map[String(teamBId)] ?? `#${teamBId}`,
		};
	};

	const handleRowClick = (row: MissingScoresheet) => {
		const { letterA, letterB } = resolveLetters(
			row.division,
			row.subdivision,
			row.teamAId,
			row.teamBId
		);
		handleMatchupSelection(letterA, letterB, row.division, row.subdivision);
		setOpen(false);
	};

	const totalCount = rows?.length ?? 0;
	const missingCount = rows?.filter((r) => r.issueType === "MISSING").length ?? 0;
	const incompleteCount = rows?.filter((r) => r.issueType !== "MISSING").length ?? 0;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					disabled={disabled || !seasonCode || !weekNum}
				>
					{totalCount > 0 ? (
						<span className="flex items-center gap-1.5">
							{missingCount > 0 && (
								<span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
									<AlertTriangle className="h-4 w-4" />
									{missingCount}
								</span>
							)}
							{missingCount > 0 && incompleteCount > 0 && <span className="text-muted-foreground">/</span>}
							{incompleteCount > 0 && (
								<span className="flex items-center gap-0.5 text-yellow-600 dark:text-yellow-400">
									<AlertTriangle className="h-4 w-4" />
									{incompleteCount}
								</span>
							)}
							<span>Missing Scoresheets</span>
						</span>
					) : (
						"Missing Scoresheets"
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[520px] bg-background">
				<DialogHeader>
					<DialogTitle>
						Missing / Incomplete Scoresheets — Week {weekNum}
					</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="py-6 text-center text-muted-foreground text-sm">
						Loading…
					</div>
				) : totalCount === 0 ? (
					<div className="py-6 text-center text-muted-foreground text-sm">
						All scoresheets for this week are complete.
					</div>
				) : (
					<ScrollArea className="max-h-[60vh] pr-2">
						<p className="text-sm text-muted-foreground mb-3">
							Click a matchup to open it in the editor.
						</p>
						<div className="space-y-2">
							{Object.keys(grouped).map((division) => (
								<Collapsible
									key={division}
									open={openDivisions[division]}
									onOpenChange={() =>
										setOpenDivisions((prev) => ({
											...prev,
											[division]: !prev[division],
										}))
									}
									className="border-b border-border pb-2"
								>
									<CollapsibleTrigger asChild>
										<Button
											variant="ghost"
											className="w-full justify-between font-medium text-base p-2 h-auto"
										>
											{division}
											{openDivisions[division] ? (
												<ChevronDown className="h-4 w-4" />
											) : (
												<ChevronRight className="h-4 w-4" />
											)}
										</Button>
									</CollapsibleTrigger>
									<CollapsibleContent className="ml-4 mt-1 space-y-1">
										{Object.keys(grouped[division]).map((subdivision) => {
											const subdivKey = `${division}-${subdivision}`;
											return (
												<Collapsible
													key={subdivKey}
													open={openSubdivisions[subdivKey]}
													onOpenChange={() =>
														setOpenSubdivisions((prev) => ({
															...prev,
															[subdivKey]: !prev[subdivKey],
														}))
													}
													className="pb-1"
												>
													<CollapsibleTrigger asChild>
														<Button
															variant="ghost"
															className="w-full justify-between text-sm p-1 h-auto"
														>
															{subdivision}
															{openSubdivisions[subdivKey] ? (
																<ChevronDown className="h-3 w-3" />
															) : (
																<ChevronRight className="h-3 w-3" />
															)}
														</Button>
													</CollapsibleTrigger>
													<CollapsibleContent className="ml-4 mt-1 space-y-1">
														{grouped[division][subdivision].map((row, idx) => {
															const { letterA, letterB } = resolveLetters(
																row.division,
																row.subdivision,
																row.teamAId,
																row.teamBId
															);
															return (
																<button
																	key={idx}
																	onClick={() => handleRowClick(row)}
																	className="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-muted text-left transition-colors"
																>
																	<span className="font-medium">
																		{letterA} vs {letterB}
																	</span>
																	{row.issueType === "MISSING" ? (
																		<span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
																			<AlertTriangle className="h-3 w-3" />
																			Not started
																		</span>
																	) : (
																		<span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
																			<AlertTriangle className="h-3 w-3" />
																			Incomplete
																		</span>
																	)}
																</button>
															);
														})}
													</CollapsibleContent>
												</Collapsible>
											);
										})}
									</CollapsibleContent>
								</Collapsible>
							))}
						</div>
					</ScrollArea>
				)}
			</DialogContent>
		</Dialog>
	);
}
