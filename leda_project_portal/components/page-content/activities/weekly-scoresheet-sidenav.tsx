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
	refreshToken?: number;
}

const SideNav = ({ seasonCode, weekNum, handleMatchupSelection, collapseOnSelection = true, refreshToken }: SideNavProps) => {
	const isByeMatchup = (game: { homeTeamId?: string; awayTeamId?: string; homeTeamLetter: string; awayTeamLetter: string }) => {
		const homeId = game.homeTeamId ? String(game.homeTeamId) : "";
		const awayId = game.awayTeamId ? String(game.awayTeamId) : "";
		if (homeId === "0" || awayId === "0") return true;
		// "X" is the BYE team letter used by the schedule system
		const homeLetter = String(game.homeTeamLetter).toUpperCase();
		const awayLetter = String(game.awayTeamLetter).toUpperCase();
		if (homeLetter === "BYE" || homeLetter === "X") return true;
		if (awayLetter === "BYE" || awayLetter === "X") return true;
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
	// Ref so effects can read current selectedMatchup without stale closure
	const selectedMatchupRef = useRef(selectedMatchup);
	useEffect(() => { selectedMatchupRef.current = selectedMatchup; }, [selectedMatchup]);

	// When the parent bumps refreshToken (after save/delete), reset completion status
	// and re-trigger the fetch by re-opening the selected matchup's subdivision (even if
	// the sidenav was collapsed via collapseOnSelection) plus any other open subdivisions.
	useEffect(() => {
		if (!refreshToken) return;
		setCompletionMap({});
		requestedStatusRef.current.clear();
		setOpenSubdivisions(prev => {
			const next = { ...prev };
			// Always ensure the currently-selected matchup's subdivision is open so status re-fetches
			const sm = selectedMatchupRef.current;
			if (sm) {
				const key = `${sm.divisionName}-${sm.subdivisionName}`;
				next[key] = true;
				setOpenDivisions(d => ({ ...d, [sm.divisionName]: true }));
			}
			return next;
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshToken]);

	const toggleDivision = (division: string) => setOpenDivisions(prev => ({ ...prev, [division]: !prev[division] }));
	const toggleSubdivision = (division: string, subdivision: string) =>
		setOpenSubdivisions(prev => ({ ...prev, [`${division}-${subdivision}`]: !prev[`${division}-${subdivision}`] }));

	// When a subdivision opens, probe each matchup's completion status from the
	// gameInfo API and update completionMap so the correct icon (✓ / ⚠) is shown
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
					// Probe completion status for bye matchups using the gameInfo endpoint
					if (requestedStatusRef.current.has(letterStatusKey) || completionMap[letterStatusKey] !== undefined) return;
					const homeIsBye = String(g.homeTeamLetter).toUpperCase() === "X" || String(g.homeTeamLetter).toUpperCase() === "BYE" || String(g.homeTeamId) === "0";
					const activeTeamLetter = homeIsBye ? g.awayTeamLetter : g.homeTeamLetter;
					let activeTeamId = homeIsBye ? (g.awayTeamId || "") : (g.homeTeamId || "");
					if (!activeTeamId) {
						try {
							const schedRes = await fetchWithSession(
								`/api/activities/schedule/subdivision?seasonCode=${encodeURIComponent(seasonCode)}&division=${encodeURIComponent(divisionName)}&subdivision=${encodeURIComponent(subdivisionName)}`,
								{ method: 'GET' }
							);
							if (schedRes.ok) {
								const schedData = await schedRes.json();
								const subdivData = schedData?.scheduleData?.[divisionName]?.[subdivisionName];
								if (subdivData?.[activeTeamLetter]) activeTeamId = subdivData[activeTeamLetter].teamId || "";
							}
						} catch { /* ignore */ }
					}
					if (!activeTeamId) {
						setCompletionMap(prev => ({ ...prev, [letterStatusKey]: false }));
						return;
					}
					requestedStatusRef.current.add(letterStatusKey);
					const finalHomeTeamId = homeIsBye ? "0" : activeTeamId;
					const finalAwayTeamId = homeIsBye ? activeTeamId : "0";
					try {
						const res = await fetchWithSession(
							`/api/activities/scoresheets/weeklyScoresheetsV2/gameInfo?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(divisionName)}&subdivision=${encodeURIComponent(subdivisionName)}&homeTeamId=${encodeURIComponent(finalHomeTeamId)}&awayTeamId=${encodeURIComponent(finalAwayTeamId)}&getStatus=true`,
							{ method: 'GET' }
						);
						if (res.status === 200) {
							const body = await res.json();
							const completed = typeof body === 'boolean' ? body : (Array.isArray(body) ? !!body[0]?.completed : false);
							setCompletionMap(prev => ({ ...prev, [letterStatusKey]: completed }));
						} else if (res.status === 204) {
							setCompletionMap(prev => ({ ...prev, [letterStatusKey]: false }));
						}
					} catch { /* ignore */ }
					return;
				}
				if (!g.homeTeamId || !g.awayTeamId) {
					let resolvedHomeId = "";
					let resolvedAwayId = "";
					try {
						const teamInfoRes = await fetchWithSession(`/api/activities/scoresheets/weeklyScoresheetsV2/teamInfo?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(divisionName)}&subdivision=${encodeURIComponent(subdivisionName)}&teamLetter=${encodeURIComponent(g.homeTeamLetter)}`, { method: 'GET' });
						if (teamInfoRes.status === 200) {
							const rows = await teamInfoRes.json();
							const homeRow = rows[0];
							const awayRow = rows[1];
							if (homeRow && awayRow) {
								resolvedHomeId = String(homeRow.teamId);
								resolvedAwayId = String(awayRow.teamId);
							}
						}
					} catch { /* fall through to schedule-based resolution below */ }

					// The leda_weekly_scoresheets_team_info row may be missing even though
					// game info (and its completed flag) was already saved, so fall back to
					// resolving team IDs from the schedule rather than assuming incomplete.
					if (!resolvedHomeId || !resolvedAwayId) {
						try {
							const schedRes = await fetchWithSession(
								`/api/activities/schedule/subdivision?seasonCode=${encodeURIComponent(seasonCode)}&division=${encodeURIComponent(divisionName)}&subdivision=${encodeURIComponent(subdivisionName)}`,
								{ method: 'GET' }
							);
							if (schedRes.ok) {
								const schedData = await schedRes.json();
								const subdivData = schedData?.scheduleData?.[divisionName]?.[subdivisionName];
								if (!resolvedHomeId && subdivData?.[g.homeTeamLetter]) resolvedHomeId = subdivData[g.homeTeamLetter].teamId || "";
								if (!resolvedAwayId && subdivData?.[g.awayTeamLetter]) resolvedAwayId = subdivData[g.awayTeamLetter].teamId || "";
							}
						} catch { /* ignore */ }
					}

					if (resolvedHomeId && resolvedAwayId) {
						// Store team IDs (including BYE matchups with teamId "0")
						setData(prev => {
							const clone: DivisionData = JSON.parse(JSON.stringify(prev));
							const game = clone[divisionName][subdivisionName][gameNumber];
							game.homeTeamId = resolvedHomeId;
							game.awayTeamId = resolvedAwayId;
							return clone;
						});
						g.homeTeamId = resolvedHomeId; g.awayTeamId = resolvedAwayId;
					} else {
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

	// Render — collapsible division/subdivision tree with per-matchup completion indicators
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
														const homeLetter = String(game.homeTeamLetter).toUpperCase();
														const awayLetter = String(game.awayTeamLetter).toUpperCase();
														if (homeId === "0" || homeLetter === "BYE" || homeLetter === "X") {
															displayText = `${game.awayTeamLetter} - Bye`;
														} else if (awayId === "0" || awayLetter === "BYE" || awayLetter === "X") {
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
													// Determine the completion status lookup key for this game
												const gameStatusKey = (() => {
													if (isBye) return `${divisionName}-${subdivisionName}-${game.homeTeamLetter}-${game.awayTeamLetter}`;
													const idKey = game.homeTeamId && game.awayTeamId
														? `${divisionName}-${subdivisionName}-${game.homeTeamId}-${game.awayTeamId}`
														: null;
													return idKey ?? `${divisionName}-${subdivisionName}-${game.homeTeamLetter}-${game.awayTeamLetter}`;
												})();
												const gameStatusKnown = completionMap[gameStatusKey] !== undefined;
												const gameCompleted = completionMap[gameStatusKey] === true;

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
																{gameStatusKnown && (
																	gameCompleted
																		? <CheckCircle className="h-4 w-4 text-green-500" />
																		: <AlertTriangle className="h-4 w-4 text-yellow-500" />
																)}
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
