"use client";

/**
 * Weekly Scoresheet Side Navigation Component
 *
 * This component renders a hierarchical navigation sidebar for weekly scoresheets:
 * - Displays divisions, subdivisions, and matchups in a collapsible tree structure
 * - Shows completion status for each matchup (yellow alert or green checkmark)
 * - Handles matchup selection and tracks the currently selected matchup
 *
 * The component receives scoresheet data and handles the user's navigation through
 * the available matchups, communicating selections back to the parent component.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	ChevronRight,
	ChevronDown,
	CheckCircle,
	AlertTriangle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DivisionData } from "@/lib/weekly-scoresheet-definitions";
import { fetchWithSession } from "@/lib/getData";

interface SideNavProps {
	seasonCode: string;
	weekNum: string;
	handleMatchupSelection: (
		homeLetter: string,
		awayLetter: string,
		divisionName: string,
		subdivisionName: string
	) => void;
	collapseOnSelection?: boolean;
}

const SideNav = ({ seasonCode, weekNum, handleMatchupSelection, collapseOnSelection = true }: SideNavProps) => {
	const isByeMatchup = (game: { homeTeamId?: string; awayTeamId?: string; homeTeamLetter: string; awayTeamLetter: string }) => {
		const homeId = game.homeTeamId ? String(game.homeTeamId) : "";
		const awayId = game.awayTeamId ? String(game.awayTeamId) : "";
		if (homeId === "0" || awayId === "0") return true;
		// Fallback for any upstream data that uses a BYE marker in the letters
		if (String(game.homeTeamLetter).toUpperCase() === "BYE") return true;
		if (String(game.awayTeamLetter).toUpperCase() === "BYE") return true;
		return false;
	};

	const { data: matchupsResponse } = useQuery({
		queryKey: ["v2-matchups", seasonCode, weekNum],
		queryFn: async () => {
			if (!seasonCode || !weekNum) return null;
			const res = await fetchWithSession(
				`/api/activities/scoresheets/weeklyScoresheetsV2/matchups?seasonCode=${encodeURIComponent(
					seasonCode
				)}&weekNum=${encodeURIComponent(weekNum)}`,
				{ method: "GET" }
			);
			if (res.status === 204) return null;
			return res.json();
		},
		enabled: !!seasonCode && !!weekNum,
		staleTime: 1000 * 60 * 10,
	});

	// Transform the simplified API format { division: { subdivision: { HOME: AWAY } } }
	// into DivisionData structure expected by the component: numbered games with letters & (later) IDs.
	const transformed: DivisionData = useMemo(() => {
		if (!matchupsResponse || !matchupsResponse.matchupData) return {};
		let raw: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
		try {
			raw = typeof matchupsResponse.matchupData === "string" ? JSON.parse(matchupsResponse.matchupData) : matchupsResponse.matchupData;
		} catch {
			return {};
		}
		const out: DivisionData = {};
		for (const division of Object.keys(raw)) {
			out[division] = {};
			for (const subdivision of Object.keys(raw[division])) {
				const mapping = raw[division][subdivision] as Record<string, string>; // { HOME: AWAY }
				let gameCounter = 1;
				out[division][subdivision] = {};
				for (const homeLetter of Object.keys(mapping)) {
					const awayLetter = mapping[homeLetter];
					out[division][subdivision][String(gameCounter)] = {
						homeTeamLetter: homeLetter,
						homeTeamId: "", // will be resolved lazily via teamInfo lookup
						awayTeamLetter: awayLetter,
						awayTeamId: "", // will be resolved lazily
					};
					gameCounter++;
				}
			}
		}
		return out;
	}, [matchupsResponse]);

	// Persist transformed data in state so we can enrich it with fetched team IDs
	const [data, setData] = useState<DivisionData>({});
	useEffect(() => {
		setData(transformed);
	}, [transformed]);

	// State to track expanded divisions and subdivisions
	const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>({});
	const [openSubdivisions, setOpenSubdivisions] = useState<Record<string, boolean>>({});
	const [selectedMatchup, setSelectedMatchup] = useState<{
		divisionName: string;
		subdivisionName: string;
		homeTeamLetter: string;
		awayTeamLetter: string;
		homeTeamId?: string;
		awayTeamId?: string;
	} | null>(null);

	// Collapse / reset navigation whenever season or week changes
	useEffect(() => {
		setOpenDivisions({});
		setOpenSubdivisions({});
		setSelectedMatchup(null);
		setCompletionMap({});
		requestedStatusRef.current.clear();
	}, [seasonCode, weekNum]);

	// Completion status
	const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({});
	const requestedStatusRef = useRef<Set<string>>(new Set());

	const toggleDivision = (division: string) => setOpenDivisions(prev => ({ ...prev, [division]: !prev[division] }));
	const toggleSubdivision = (division: string, subdivision: string) =>
		setOpenSubdivisions(prev => ({ ...prev, [`${division}-${subdivision}`]: !prev[`${division}-${subdivision}`] }));

	// When a subdivision opens, probe
	useEffect(() => {
		const openKeys = Object.entries(openSubdivisions).filter(([, o]) => o).map(([k]) => k);
		if (!seasonCode || !weekNum || openKeys.length === 0) return;
		openKeys.forEach(subdivKey => {
			const [divisionName, subdivisionName] = subdivKey.split("-");
			const games = data?.[divisionName]?.[subdivisionName] || {};
			Object.keys(games).forEach(async gameNumber => {
				const g = games[gameNumber];
				const letterStatusKey = `${divisionName}-${subdivisionName}-${g.homeTeamLetter}-${g.awayTeamLetter}`;
				if (isByeMatchup({
					homeTeamId: g.homeTeamId,
					awayTeamId: g.awayTeamId,
					homeTeamLetter: g.homeTeamLetter,
					awayTeamLetter: g.awayTeamLetter,
				})) {
					// Don't probe completion status for BYE matchups
					return;
				}
				if (!g.homeTeamId || !g.awayTeamId) {
					try {
						const teamInfoRes = await fetchWithSession(`/api/activities/scoresheets/weeklyScoresheetsV2/teamInfo?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(divisionName)}&subdivision=${encodeURIComponent(subdivisionName)}&teamLetter=${encodeURIComponent(g.homeTeamLetter)}`, { method: 'GET' });
						if (teamInfoRes.status === 200) {
							const rows = await teamInfoRes.json();
							const homeRow = rows[0];
							const awayRow = rows[1];
							if (homeRow && awayRow) {
								const homeId = String(homeRow.teamId);
								const awayId = String(awayRow.teamId);
								// Store team IDs (including BYE matchups with teamId "0")
								setData(prev => {
									const clone: DivisionData = JSON.parse(JSON.stringify(prev));
									const game = clone[divisionName][subdivisionName][gameNumber];
									game.homeTeamId = homeId;
									game.awayTeamId = awayId;
									return clone;
								});
								g.homeTeamId = homeId; g.awayTeamId = awayId;
							}
						} else {
							setCompletionMap(prev => ({ ...prev, [letterStatusKey]: false }));
						}
					} catch {
						setCompletionMap(prev => ({ ...prev, [letterStatusKey]: false }));
					}
				}
				if (g.homeTeamId && g.awayTeamId) {
					if (String(g.homeTeamId) === "0" || String(g.awayTeamId) === "0") return;
					const statusKey = `${divisionName}-${subdivisionName}-${g.homeTeamId}-${g.awayTeamId}`;
					if (requestedStatusRef.current.has(statusKey) || completionMap[statusKey] !== undefined) return;
					requestedStatusRef.current.add(statusKey);
					try {
						const res = await fetchWithSession(`/api/activities/scoresheets/weeklyScoresheetsV2/gameInfo?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(divisionName)}&subdivision=${encodeURIComponent(subdivisionName)}&homeTeamId=${encodeURIComponent(g.homeTeamId)}&awayTeamId=${encodeURIComponent(g.awayTeamId)}&getStatus=true`, { method: 'GET' });
						if (res.status === 200) {
							const body = await res.json();
							let completed = false; if (typeof body === 'boolean') completed = body; else if (Array.isArray(body)) completed = !!body[0]?.completed;
							setCompletionMap(prev => ({ ...prev, [statusKey]: completed }));
						} else if (res.status === 204) {
							setCompletionMap(prev => ({ ...prev, [statusKey]: false }));
						}
					} catch { /* ignore */ }
				}
			});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openSubdivisions, data, seasonCode, weekNum]);

	if (!data || Object.keys(data).length === 0) {
		return <div className="w-64 border-r h-full flex items-center justify-center p-4"><p className="text-muted-foreground text-center">Select a week to display weekly scoresheets...</p></div>;
	}

	const subdivisionLoaded = (divisionName: string, subdivisionName: string) => {
		const games = data[divisionName][subdivisionName];
		return Object.keys(games).every(gn => {
			const g = games[gn];
			if (isByeMatchup({
				homeTeamId: g.homeTeamId,
				awayTeamId: g.awayTeamId,
				homeTeamLetter: g.homeTeamLetter,
				awayTeamLetter: g.awayTeamLetter,
			})) return true;
			const idKey = g.homeTeamId && g.awayTeamId ? `${divisionName}-${subdivisionName}-${g.homeTeamId}-${g.awayTeamId}` : null;
			const letterKey = `${divisionName}-${subdivisionName}-${g.homeTeamLetter}-${g.awayTeamLetter}`;
			return (idKey !== null && completionMap[idKey] !== undefined) || completionMap[letterKey] !== undefined;
		});
	};

	return (
		<div className="w-64">
			<ScrollArea className="h-full">
				<div className="p-4 space-y-2">
					{Object.keys(data).map(divisionName => (
						<Collapsible key={divisionName} open={openDivisions[divisionName]} onOpenChange={() => toggleDivision(divisionName)} className="border-b border-border pb-2">
							<CollapsibleTrigger asChild>
								<Button variant="ghost" className="w-full justify-between font-medium text-lg p-2 h-auto">
									{divisionName}
									{openDivisions[divisionName] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="ml-4 mt-1 space-y-1">
								{Object.keys(data[divisionName]).map(subdivisionName => {
									const subdivKey = `${divisionName}-${subdivisionName}`;
									const loaded = subdivisionLoaded(divisionName, subdivisionName);
									const gamesObj = data[divisionName][subdivisionName];
									return (
										<Collapsible key={subdivKey} open={openSubdivisions[subdivKey]} onOpenChange={() => toggleSubdivision(divisionName, subdivisionName)} className="pb-1">
											<CollapsibleTrigger asChild>
												<Button variant="ghost" className="w-full justify-between text-base p-1 h-auto">
													{subdivisionName}
													{openSubdivisions[subdivKey] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
												</Button>
											</CollapsibleTrigger>
											<CollapsibleContent className="ml-4 mt-1 space-y-1">
												{Object.keys(gamesObj).map(gameNumber => {
													const game = gamesObj[gameNumber];
													const isBye = isByeMatchup({
														homeTeamId: game.homeTeamId,
														awayTeamId: game.awayTeamId,
														homeTeamLetter: game.homeTeamLetter,
														awayTeamLetter: game.awayTeamLetter,
													});
													
													// Format display text for BYE matchups
													let displayText = `${game.homeTeamLetter} - ${game.awayTeamLetter}`;
													if (isBye) {
														const homeId = game.homeTeamId ? String(game.homeTeamId) : "";
														const awayId = game.awayTeamId ? String(game.awayTeamId) : "";
														if (homeId === "0") {
															displayText = `${game.awayTeamLetter} - Bye`;
														} else if (awayId === "0") {
															displayText = `${game.homeTeamLetter} - Bye`;
														} else if (String(game.homeTeamLetter).toUpperCase() === "BYE") {
															displayText = `${game.awayTeamLetter} - Bye`;
														} else if (String(game.awayTeamLetter).toUpperCase() === "BYE") {
															displayText = `${game.homeTeamLetter} - Bye`;
														}
													}
													
													const isSelected = (() => {
														if (!selectedMatchup) return false;
														if (
															selectedMatchup.divisionName !== divisionName ||
															selectedMatchup.subdivisionName !== subdivisionName
														) {
															return false;
														}

														// Prefer stable identity: team IDs (when known)
														if (
															selectedMatchup.homeTeamId &&
															selectedMatchup.awayTeamId &&
															game.homeTeamId &&
															game.awayTeamId
														) {
															return (
																selectedMatchup.homeTeamId === game.homeTeamId &&
																selectedMatchup.awayTeamId === game.awayTeamId
															);
														}

														// Fallback: letters + division/subdivision (prevents cross-subdivision collisions)
														return (
															selectedMatchup.homeTeamLetter === game.homeTeamLetter &&
															selectedMatchup.awayTeamLetter === game.awayTeamLetter
														);
													})();
													return (
														<Button
															key={`${subdivKey}-${gameNumber}`}
															variant="ghost"
															className={`w-full justify-start text-sm p-1 h-auto ${isSelected ? 'bg-secondary cursor-not-allowed opacity-75' : 'hover:bg-muted'}`}
															disabled={isSelected || isBye}
															aria-disabled={isSelected || isBye}
															onClick={() => {
																if (isSelected || isBye) return; // safety
																setSelectedMatchup({
																	divisionName,
																	subdivisionName,
																	homeTeamLetter: game.homeTeamLetter,
																	awayTeamLetter: game.awayTeamLetter,
																	homeTeamId: game.homeTeamId || undefined,
																	awayTeamId: game.awayTeamId || undefined,
																});
																handleMatchupSelection(game.homeTeamLetter, game.awayTeamLetter, divisionName, subdivisionName);
																// Collapse sidenav after selection if enabled
																if (collapseOnSelection) {
																	setOpenDivisions({});
																	setOpenSubdivisions({});
																}
															}}
														>
															<div className="flex items-center gap-2">
																<span>{displayText}</span>
																{!isBye && loaded && (() => { const idKey = game.homeTeamId && game.awayTeamId ? `${divisionName}-${subdivisionName}-${game.homeTeamId}-${game.awayTeamId}` : null; const letterKey = `${divisionName}-${subdivisionName}-${game.homeTeamLetter}-${game.awayTeamLetter}`; const completed = idKey !== null ? completionMap[idKey] === true : completionMap[letterKey] === true; return completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />; })()}
															</div>
														</Button>
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
		</div>
	);
};

export default SideNav;
