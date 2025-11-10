"use client";

/**
 * Weekly Scoresheets Content Component
 *
 * This component manages the weekly scoresheets for LEDA matches, allowing users to:
 * - Select a season and week
 * - View and select team matchups
 * - Track player participation in games
 * - Record game wins, points, and penalties
 * - Calculate and save team and player points
 *
 * The component handles complex state management for tracking game data,
 * penalties, and point calculations across multiple teams and players.
 */

import { useEffect, useState, useCallback } from "react";
import { MentionPlayerHistory } from "@/lib/definitions";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeasonCodeSelector from "@/components/ui/roster-season-code-selector";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import WeekSelector from "@/components/ui/week-selector";
import { teamRoute, playerRoute, mentionPlayerHistoryRoute, rosterTeamViewRoute, memberInfoRoute } from "@/lib/apiRoutes";
import FolderTab, { FolderTabMed } from "@/components/ui/folder-tab";
import { Player } from "@/lib/definitions";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import SideNav from "./weekly-scoresheet-sidenav";
import PenaltyAddForm from "@/components/forms/activities/weekly-scoresheet-add-penalty-form";
import { Team, TeamGameData } from "@/lib/weekly-scoresheet-definitions";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import MentionSelector from "@/components/ui/mentions-selector";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { isMatchupValid } from "@/utils/matchupValidation"; // deprecated automatic validation
// Import React Query hooks
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";
import { useForm, FormProvider } from "react-hook-form";

// Removed legacy deep merge and schedule conversion utilities (normalized model)

// Utility function to check if all matchups are filled out and valid
// Deprecated: automatic validation replaced by manual completion control
// (Removed old misplaced fetch code that caused syntax errors.)

// Removed legacy generateEmptyMatchupData; now relying solely on V2 baselines

const createMentionHistory = async (data: {
	ledaId: string;
	mentionId: string;
	mentionCode: string;
	mentionDesc: string;
	mentionPoints: number;
	seasonCode: string;
	weekNum: number;
	notes: string;
	count?: number;
	teamId?: string;
}) => {
	const response = await fetchWithSession(mentionPlayerHistoryRoute, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			...data,
			count: data.count ?? 0,
		}),
	});
	return response.json();
};

	// V2 API routes (local constants)
	const weeklyScoresheetsV2PlayersRoute =
		"/api/activities/scoresheets/weeklyScoresheetsV2/players";
	const weeklyScoresheetsV2GameInfoRoute =
		"/api/activities/scoresheets/weeklyScoresheetsV2/gameInfo";
	const weeklyScoresheetsV2TeamInfoRoute =
		"/api/activities/scoresheets/weeklyScoresheetsV2/teamInfo";

	// Legacy aggregate points endpoints (must remain in use for leaderboards/history)
	const weeklyPlayerPointsRoute = "/api/activities/scoresheets/playerPoints"; // expects PlayerPoints shape
	const weeklyTeamPointsRoute = "/api/activities/scoresheets/teamPoints"; // expects TeamPoints shape

	// Data fetchers
	// Removed legacy schedule fetch (SideNav handles V2 matchups)

	// Removed legacy fetchScoresheet

	const fetchTeam = async (teamId: string) => {
		const url = `${teamRoute}?ledaId=${encodeURIComponent(teamId)}`;
		const response = await fetchWithSession(url, { method: "GET" });
		return response.json();
	};

	const fetchPlayer = async (playerId: string | number) => {
		const url = `${playerRoute}?ledaId=${encodeURIComponent(
			String(playerId)
		)}`;
		const response = await fetchWithSession(url, { method: "GET" });
		return response.json();
	};

	const fetchRosterTeamId = async ({
		seasonCode,
		division,
		subdivision,
		teamLetter,
	}: {
		seasonCode: string;
		division: string;
		subdivision: string;
		teamLetter: string;
	}) => {
		const url = `${rosterTeamViewRoute}?seasonCode=${encodeURIComponent(seasonCode)}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(subdivision)}&teamLetter=${encodeURIComponent(teamLetter)}`;
		const res = await fetchWithSession(url, { method: "GET" });
		const data = await res.json();
		return data[0]?.ledaid || null;
	};

	const fetchTeamMembers = async (teamId: string) => {
		const url = `${memberInfoRoute}?ledaId=${encodeURIComponent(teamId)}`;
		const res = await fetchWithSession(url, { method: "GET" });
		return res.json();
	};

	const fetchTeamInfoV2 = async ({
		seasonCode,
		weekNum,
		division,
		subdivision,
		teamLetter,
	}: { seasonCode: string; weekNum: string; division: string; subdivision: string; teamLetter: string; }) => {
		const url = `${weeklyScoresheetsV2TeamInfoRoute}?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(subdivision)}&teamLetter=${encodeURIComponent(teamLetter)}`;
		const res = await fetchWithSession(url, { method: "GET" });
		if (res.status === 204) return null;
		return res.json();
	};

	const fetchGameInfoV2 = async ({
		seasonCode,
		weekNum,
		division,
		subdivision,
		homeTeamId,
		awayTeamId,
	}: {
		seasonCode: string;
		weekNum: string;
		division: string;
		subdivision: string;
		homeTeamId: string;
		awayTeamId: string;
	}) => {
		const url = `${weeklyScoresheetsV2GameInfoRoute}?seasonCode=${encodeURIComponent(
			seasonCode
		)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(
			division
		)}&subdivision=${encodeURIComponent(
			subdivision
		)}&homeTeamId=${encodeURIComponent(
			homeTeamId
		)}&awayTeamId=${encodeURIComponent(awayTeamId)}`;
		const res = await fetchWithSession(url, { method: "GET" });
		if (res.status === 204) return null;
		return res.json();
	};

	// Mutations helpers for V2 tables
	const savePlayerPoints = async ({
		seasonCode,
		weekNum,
		division,
		subdivision,
		ledaId,
		teamId,
		gameStats,
	}: {
		seasonCode: string;
		weekNum: number;
		division: string;
		subdivision: string;
		ledaId: string;
		teamId: string;
		gameStats: Record<string, boolean>;
	}) => {
		const response = await fetchWithSession(
			weeklyScoresheetsV2PlayersRoute,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					seasonCode,
					weekNum,
					division,
					subdivision,
					ledaId,
					teamId,
					gameStats,
				}),
			}
		);
		return response.json();
	};

	const saveGameInfo = async ({
		seasonCode,
		weekNum,
		division,
		subdivision,
		homeTeamId,
		awayTeamId,
		homePoints,
		awayPoints,
		completed,
		gameInfo,
	}: {
		seasonCode: string;
		weekNum: number;
		division: string;
		subdivision: string;
		homeTeamId: string;
		awayTeamId: string;
		homePoints: number;
		awayPoints: number;
		completed: boolean;
		gameInfo: Record<string, { homeWin: boolean; homePoints: string; awayPoints: string }>;
	}) => {
		const response = await fetchWithSession(
			weeklyScoresheetsV2GameInfoRoute,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					seasonCode,
					weekNum,
					division,
					subdivision,
					homeTeamId,
					awayTeamId,
					homePoints,
					awayPoints,
					completed,
					gameInfo,
				}),
			}
		);
		return response.json();
	};

	// Legacy weekly cumulative team points upsert (stores rolling totals)
	const saveWeeklyTeamPoints = async ({
		seasonCode,
		weekNum,
		ledaId,
		totalPoints,
	}: {
		seasonCode: string;
		weekNum: number;
		ledaId: string; // team ID
		totalPoints: number; // this week's points before cumulative calc (server derives prev + new)
	}) => {
		const res = await fetchWithSession(weeklyTeamPointsRoute, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ seasonCode, weekNum, ledaId, totalPoints }),
		});
		return res.json();
	};

	// Legacy weekly cumulative player points upsert
	// ASSUMPTION: A player's weekly points = number of games participated (boolean true in gameStats)
	// If a different formula (e.g., includes mentions), adjust here.
	const saveWeeklyPlayerPoints = async ({
		seasonCode,
		weekNum,
		ledaId,
		teamLedaId,
		totalPoints,
	}: {
		seasonCode: string;
		weekNum: number;
		ledaId: string; // player ID
		teamLedaId: string; // team ID
		totalPoints: number; // this week's points
	}) => {
		const res = await fetchWithSession(weeklyPlayerPointsRoute, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ seasonCode, weekNum, ledaId, teamLedaId, totalPoints }),
		});
		return res.json();
	};

const updateMentionHistory = async (data: {
	ledaId: string;
	mentionId: string;
	mentionCode: string;
	mentionDesc: string;
	mentionPoints: number;
	seasonCode: string;
	weekNum: number;
	notes: string;
	count?: number;
	teamId?: string;
}) => {
	const response = await fetchWithSession(mentionPlayerHistoryRoute, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			...data,
			count: data.count ?? 0,
		}),
	});
	return response.json();
};

const deleteGameInfo = async ({
	seasonCode,
	weekNum,
	division,
	subdivision,
	homeTeamId,
	awayTeamId,
}: {
	seasonCode: string;
	weekNum: string | number;
	division: string;
	subdivision: string | number;
	homeTeamId: string;
	awayTeamId: string;
}) => {
	const url = `${weeklyScoresheetsV2GameInfoRoute}?seasonCode=${encodeURIComponent(String(seasonCode))}&weekNum=${encodeURIComponent(String(weekNum))}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(String(subdivision))}&homeTeamId=${encodeURIComponent(homeTeamId)}&awayTeamId=${encodeURIComponent(awayTeamId)}`;
	const res = await fetchWithSession(url, { method: "DELETE" });
	return res.json();
};

const saveTeamInfo = async ({
	seasonCode,
	weekNum,
	division,
	subdivision,
	home,
	teamId,
	teamName,
	teamLetter,
	opposingTeamId,
	penalties,
}: {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: string;
	home: boolean;
	teamId: string;
	teamName: string;
	teamLetter: string;
	opposingTeamId: string;
	penalties: Record<string, { penaltyCode: string; points: number; notes?: string }>;
}) => {
	const response = await fetchWithSession(weeklyScoresheetsV2TeamInfoRoute, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			seasonCode,
			weekNum,
			division,
			subdivision,
			home,
			teamId,
			teamName,
			teamLetter,
			opposingTeamId,
			penalties,
		}),
	});
	return response.json();
};

const deleteMentionHistory = async (data: {
	ledaId: string;
	mentionId: string;
	mentionCode: string;
	mentionDesc: string;
	mentionPoints: number;
	seasonCode: string;
	weekNum: number;
	notes: string;
	teamId?: string;
}) => {
	const response = await fetchWithSession(mentionPlayerHistoryRoute, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	return response.json();
};

// Simple wrapper component for MentionSelector that doesn't require React Hook Form
function MentionSelectorWrapper({ 
	onMentionChange, 
	initialValue 
}: { 
	onMentionChange: (value: {
		mentionCode: string;
		desc: string;
		points: string;
		mentionBasis: string;
	}) => void;
	initialValue?: {
		mentionCode: string;
		desc: string;
		points: string;
		mentionBasis: string;
	} | null;
}) {
	// Use the imported useForm hook
	const form = useForm({
		defaultValues: {
			mentionData: initialValue || {}
		}
	});

	return (
		<FormProvider {...form}>
			<MentionSelector
				control={form.control}
				name="mentionData"
				label=""
				disabled={false}
				handleMentionChange={onMentionChange}
			/>
		</FormProvider>
	);
}

export default function WeeklyScoresheetsContent({
	renderSeasonCode,
	}: {
		renderSeasonCode?: string;
	}) {
		// Local state for mentions for the currently selected player
		const [currentPlayerMentions, setCurrentPlayerMentions] = useState<MentionPlayerHistory[] | null>(null);
	// React Query client not needed for legacy invalidations anymore

	// State declarations
	const [seasonCode, setSeasonCode] = useState<string>("");
	const [currentSeason, setCurrentSeason] = useState<boolean>(true);
	const [seasonSelected, setSeasonSelected] = useState<boolean>(true);

	// Team and matchup state
	// Removed legacy sidenavData (SideNav fetches V2 matchups directly)
	const [matchSelected, setMatchSelected] = useState<boolean>(false);
	const [selectedHomeLetter, setSelectedHomeLetter] = useState<string>("");
	const [selectedAwayLetter, setSelectedAwayLetter] = useState<string>("");
	const [selectedDivision, setSelectedDivision] = useState<string>("");
	const [selectedSubdivision, setSelectedSubdivision] = useState<string>("");
	const [selectedHomeTeamId, setSelectedHomeTeamId] = useState<string>("");
	const [selectedAwayTeamId, setSelectedAwayTeamId] = useState<string>("");
	// Token to force refetch of player game-stats even if React Query cache considers data fresh
	const [matchupLoadToken, setMatchupLoadToken] = useState<number>(0);

	// Game data state
	const [homeTeamGameData, setHomeTeamGameData] = useState<TeamGameData>({});
	const [awayTeamGameData, setAwayTeamGameData] = useState<TeamGameData>({});

	// Game points and wins state
	const [homeWins, setHomeWins] = useState<boolean[]>(Array(11).fill(false));
	const [homePoints, setHomePoints] = useState<string[]>(Array(11).fill(""));
	const [awayPoints, setAwayPoints] = useState<string[]>(Array(11).fill(""));

	// API operation state
	const [selectedWeek, setSelectedWeek] = useState<string>("");
	const [isDataChanged, setIsDataChanged] = useState<boolean>(false);

	// Manual completion and reset snapshot state
	const [isMatchupCompleted, setIsMatchupCompleted] = useState<boolean>(false);
	const [originalMatchupSnapshot, setOriginalMatchupSnapshot] = useState<
		| null
		| {
			Home: {
				teamGameData: TeamGameData;
				wins: boolean[];
				points: string[];
				penalties: Record<
					string,
					{ penaltyCode: string; points: number; notes?: string }
				>;
			};
			Away: {
				teamGameData: TeamGameData;
				points: string[];
				penalties: Record<
					string,
					{ penaltyCode: string; points: number; notes?: string }
				>;
			};
		}
	>(null);

	// Snapshot for change detection and hydration flags
	type Snapshot = {
		Home: { teamGameData: TeamGameData; wins: boolean[]; points: string[]; penalties: Record<string, { penaltyCode: string; points: number; notes?: string }> };
		Away: { teamGameData: TeamGameData; points: string[]; penalties: Record<string, { penaltyCode: string; points: number; notes?: string }> };
		completed: boolean;
	};
	const [lastSavedSnapshot, setLastSavedSnapshot] = useState<Snapshot | null>(null);
	const [baselineInitialized, setBaselineInitialized] = useState<boolean>(false);
	const [homeHydrated, setHomeHydrated] = useState<boolean>(false);
	const [awayHydrated, setAwayHydrated] = useState<boolean>(false);

	// Penalty management state
	const [homePenaltyDialogOpen, setHomePenaltyDialogOpen] =
		useState<boolean>(false);
	const [awayPenaltyDialogOpen, setAwayPenaltyDialogOpen] =
		useState<boolean>(false);
	const [selectedPenaltyTeamId, setSelectedPenaltyTeamId] =
		useState<string>("");
	const [selectedPenaltyTeamName, setSelectedPenaltyTeamName] =
		useState<string>("");
	const [penaltyEditMode, setPenaltyEditMode] = useState<boolean>(false);
	const [currentEditingPenalty, setCurrentEditingPenalty] = useState<{
		id: string;
		code: string;
		points: number;
		notes: string;
	} | null>(null);
	const [homePenaltyCounter, setHomePenaltyCounter] = useState<number>(0);
	const [awayPenaltyCounter, setAwayPenaltyCounter] = useState<number>(0);
	const [homePenalties, setHomePenalties] = useState<Record<string, { penaltyCode: string; points: number; notes?: string }>>({});
	const [awayPenalties, setAwayPenalties] = useState<Record<string, { penaltyCode: string; points: number; notes?: string }>>({});

	// Mentions management state
	const [mentionCounters, setMentionCounters] = useState<
		Record<string, number>
	>({});
	const [mentionDialogOpen, setMentionDialogOpen] = useState<boolean>(false);
	const [selectedPlayerForMention, setSelectedPlayerForMention] = useState<{
		id: string;
		name: string;
		teamId: string;
		teamName: string;
	} | null>(null);
	const [mentionEditMode, setMentionEditMode] = useState<boolean>(false);
	const [currentEditingMention, setCurrentEditingMention] = useState<{
		id: string;
		code: string;
		desc: string;
		points: number;
		notes: string;
		count: number;
	} | null>(null);

	// Mention form state
	const [selectedMentionData, setSelectedMentionData] = useState<{
		mentionCode: string;
		desc: string;
		points: string;
		mentionBasis: string;
	} | null>(null);
	const [mentionPoints, setMentionPoints] = useState<number>(0);
	const [mentionCount, setMentionCount] = useState<number>(0);
	const [mentionNotes, setMentionNotes] = useState<string>("");

	// React Query hooks
	// Schedule data query
// Removed legacy schedule query

	// Removed legacy scoresheet query; V2 per-matchup flow only

	// Team data queries - with fallback to roster if not yet created
	const { data: homeTeamData, isLoading: isHomeTeamLoading } = useQuery({
		queryKey: ["team", selectedHomeTeamId, seasonCode, selectedDivision, selectedSubdivision, selectedHomeLetter],
		queryFn: async () => {
			if (!selectedHomeTeamId) return null;
			
			// First try to fetch existing team
			const teamData = await fetchTeam(selectedHomeTeamId);
			if (teamData && teamData.ledaId) {
				return teamData;
			}

			// If team doesn't exist yet, fetch from roster view and member info
			const subdivisionNum = selectedSubdivision.replace('Subdivision ', '');
			const teamId = await fetchRosterTeamId({
				seasonCode,
				division: selectedDivision,
				subdivision: subdivisionNum,
				teamLetter: selectedHomeLetter,
			});

			if (!teamId) return null;

			// Fetch members for this team
			const members = await fetchTeamMembers(teamId);
			
			// Format to match Team interface (map ledaid from DB to ledaId for interface)
			const memberIdList: Record<string, { ledaId: string }> = {};
			members.forEach((member: { ledaid: string }, idx: number) => {
				memberIdList[idx] = { ledaId: member.ledaid };
			});

			return {
				ledaId: teamId,
				memberIdList,
				teamLetter: selectedHomeLetter,
				division: selectedDivision,
				subdivision: selectedSubdivision,
			};
		},
		enabled: !!selectedHomeTeamId && matchSelected,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

	const { data: awayTeamData, isLoading: isAwayTeamLoading } = useQuery({
		queryKey: ["team", selectedAwayTeamId, seasonCode, selectedDivision, selectedSubdivision, selectedAwayLetter],
		queryFn: async () => {
			if (!selectedAwayTeamId) return null;
			
			// First try to fetch existing team
			const teamData = await fetchTeam(selectedAwayTeamId);
			if (teamData && teamData.ledaId) {
				return teamData;
			}

			// If team doesn't exist yet, fetch from roster view and member info
			const subdivisionNum = selectedSubdivision.replace('Subdivision ', '');
			const teamId = await fetchRosterTeamId({
				seasonCode,
				division: selectedDivision,
				subdivision: subdivisionNum,
				teamLetter: selectedAwayLetter,
			});

			if (!teamId) return null;

			// Fetch members for this team
			const members = await fetchTeamMembers(teamId);
			
			// Format to match Team interface (map ledaid from DB to ledaId for interface)
			const memberIdList: Record<string, { ledaId: string }> = {};
			members.forEach((member: { ledaid: string }, idx: number) => {
				memberIdList[idx] = { ledaId: member.ledaid };
			});

			return {
				ledaId: teamId,
				memberIdList,
				teamLetter: selectedAwayLetter,
				division: selectedDivision,
				subdivision: selectedSubdivision,
			};
		},
		enabled: !!selectedAwayTeamId && matchSelected,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

	// Player data queries
// Mentions data queries for current matchup players
// Removed getMentionsForPlayers function - no longer needed since mentions are fetched on-demand

// homePlayerIds and awayPlayerIds must be defined after homeTeamPlayerData and awayTeamPlayerData
	// ...existing code for useQuery hooks for homeTeamPlayerData and awayTeamPlayerData...

	// Removed homeMentionsByPlayer and awayMentionsByPlayer state - no longer needed since mentions are fetched on-demand


	
	const { data: homeTeamPlayerData, isLoading: isHomePlayersLoading } = useQuery({
		queryKey: ["teamPlayers", selectedHomeTeamId],
		queryFn: async () => {
			if (!homeTeamData?.memberIdList) return [];
			
			const players: Player[] = [];
			for (const playerKey in homeTeamData.memberIdList) {
				const playerInfo = homeTeamData.memberIdList[playerKey];
				const playerData = await fetchPlayer(playerInfo.ledaId);
				players.push(playerData);
			}
			return players;
		},
		enabled: !!homeTeamData && !!homeTeamData.memberIdList,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

	const { data: awayTeamPlayerData, isLoading: isAwayPlayersLoading } = useQuery({
		queryKey: ["teamPlayers", selectedAwayTeamId],
		queryFn: async () => {
			if (!awayTeamData?.memberIdList) return [];
			
			const players: Player[] = [];
			for (const playerKey in awayTeamData.memberIdList) {
				const playerInfo = awayTeamData.memberIdList[playerKey];
				const playerData = await fetchPlayer(playerInfo.ledaId);
				players.push(playerData);
			}
			return players;
		},
		enabled: !!awayTeamData && !!awayTeamData.memberIdList,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

	// Helper: build blank TeamGameData map from roster players
	const buildBlankGameData = (players?: Player[]): TeamGameData => {
		const map: TeamGameData = {};
		(players || []).forEach((p) => {
			// Player interface should have ledaId; fall back to id if present
			// Cast narrowly instead of using any
			const maybeAny = p as { ledaId?: string | number; id?: string | number };
			const pid = maybeAny.ledaId ?? maybeAny.id;
			if (pid !== undefined && pid !== null) {
				map[String(pid)] = {};
			}
		});
		return map;
	};

	// V2 player game-stats hydration (per team, per week)
	const { isLoading: isHomeGameStatsLoading } = useQuery({
		queryKey: ["v2-playerPoints", seasonCode, selectedWeek, selectedDivision, selectedSubdivision, selectedHomeTeamId, homeTeamPlayerData?.length || 0, matchupLoadToken],
		queryFn: async () => {
			if (!seasonCode || !selectedWeek || !selectedHomeTeamId) return [];
			const url = `${weeklyScoresheetsV2PlayersRoute}?seasonCode=${encodeURIComponent(String(seasonCode))}&weekNum=${encodeURIComponent(String(selectedWeek))}&teamId=${encodeURIComponent(String(selectedHomeTeamId))}`;
			console.log("[v2-playerPoints] Fetch HOME gameStats", { url, selectedHomeTeamId, selectedDivision, selectedSubdivision, matchupLoadToken });
			const res = await fetchWithSession(url, { method: "GET" });
			if (res.status === 204) {
				// No saved stats yet: fall back to roster with blank gameStats
				setHomeTeamGameData(buildBlankGameData(homeTeamPlayerData as Player[]));
				setHomeHydrated(true);
				return [];
			}
			const rows = await res.json();
			if (!Array.isArray(rows) || rows.length === 0) {
				setHomeTeamGameData(buildBlankGameData(homeTeamPlayerData as Player[]));
				setHomeHydrated(true);
				return rows;
			}
			const map: TeamGameData = {};
			(rows || []).forEach((r: { ledaId: string | number; gameStats?: Record<string, boolean> }) => {
				map[String(r.ledaId)] = r.gameStats || {};
			});
			setHomeTeamGameData(map);
			setHomeHydrated(true);
			return rows;
		},
		enabled: !!seasonCode && !!selectedWeek && !!selectedHomeTeamId && matchSelected && !!homeTeamPlayerData,
		staleTime: 1000 * 60 * 5,
		refetchOnMount: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
	});

	const { isLoading: isAwayGameStatsLoading } = useQuery({
		queryKey: ["v2-playerPoints", seasonCode, selectedWeek, selectedDivision, selectedSubdivision, selectedAwayTeamId, awayTeamPlayerData?.length || 0, matchupLoadToken],
		queryFn: async () => {
			if (!seasonCode || !selectedWeek || !selectedAwayTeamId) return [];
			const url = `${weeklyScoresheetsV2PlayersRoute}?seasonCode=${encodeURIComponent(String(seasonCode))}&weekNum=${encodeURIComponent(String(selectedWeek))}&teamId=${encodeURIComponent(String(selectedAwayTeamId))}`;
			console.log("[v2-playerPoints] Fetch AWAY gameStats", { url, selectedAwayTeamId, selectedDivision, selectedSubdivision, matchupLoadToken });
			const res = await fetchWithSession(url, { method: "GET" });
			if (res.status === 204) {
				setAwayTeamGameData(buildBlankGameData(awayTeamPlayerData as Player[]));
				setAwayHydrated(true);
				return [];
			}
			const rows = await res.json();
			if (!Array.isArray(rows) || rows.length === 0) {
				setAwayTeamGameData(buildBlankGameData(awayTeamPlayerData as Player[]));
				setAwayHydrated(true);
				return rows;
			}
			const map: TeamGameData = {};
			(rows || []).forEach((r: { ledaId: string | number; gameStats?: Record<string, boolean> }) => {
				map[String(r.ledaId)] = r.gameStats || {};
			});
			setAwayTeamGameData(map);
			setAwayHydrated(true);
			return rows;
		},
		enabled: !!seasonCode && !!selectedWeek && !!selectedAwayTeamId && matchSelected && !!awayTeamPlayerData,
		staleTime: 1000 * 60 * 5,
		refetchOnMount: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
	});
	// Local state for mentions by player (must be after player data queries)
// Declare only once, after player data queries

// ...existing code for useQuery hooks for homeTeamPlayerData and awayTeamPlayerData...

// Removed automatic mention fetching - mentions are now only fetched when user clicks mention button
	// Removed legacy scoresheet save; normalization only



	const savePlayerPointsMutation = useMutation({
		mutationFn: savePlayerPoints,
	});

	const saveGameInfoMutation = useMutation({
		mutationFn: saveGameInfo,
	});

	// Legacy cumulative points mutations
	const saveWeeklyTeamPointsMutation = useMutation({ mutationFn: saveWeeklyTeamPoints });
	const saveWeeklyPlayerPointsMutation = useMutation({ mutationFn: saveWeeklyPlayerPoints });

	const createMentionHistoryMutation = useMutation({
		mutationFn: createMentionHistory,
	});

	const updateMentionHistoryMutation = useMutation({
		mutationFn: updateMentionHistory,
	});

	const deleteMentionHistoryMutation = useMutation({
		mutationFn: deleteMentionHistory,
	});

	// Delete mutations for normalized clear
	const deleteGameInfoMutation = useMutation({
		mutationFn: deleteGameInfo,
	});

	const deletePlayerInfoForTeam = async ({
		seasonCode,
		weekNum,
		teamId,
	}: { seasonCode: string; weekNum: string | number; teamId: string }) => {
		const url = `${weeklyScoresheetsV2PlayersRoute}?seasonCode=${encodeURIComponent(String(seasonCode))}&weekNum=${encodeURIComponent(String(weekNum))}&teamId=${encodeURIComponent(teamId)}`;
		const res = await fetchWithSession(url, { method: "DELETE" });
		return res.json();
	};

	const deletePlayerInfoMutation = useMutation({
		mutationFn: deletePlayerInfoForTeam,
	});

	// New V2 mutations for team baseline inserts
	const saveTeamInfoMutation = useMutation({
		mutationFn: saveTeamInfo,
	});

	// Removed legacy saveScoresheet; saveMatchup now persists directly to V2 tables

	// Derived state
	const isLoading = 
		isHomeTeamLoading || 
		isAwayTeamLoading || 
		isHomePlayersLoading || 
		isAwayPlayersLoading ||
		isHomeGameStatsLoading ||
		isAwayGameStatsLoading;
	
	const isSaving = 
		saveGameInfoMutation.isPending || 
		savePlayerPointsMutation.isPending;

	const homeTeamInformation = homeTeamData as Team | undefined;
	const awayTeamInformation = awayTeamData as Team | undefined;
	const homeTeamPlayerInformation = homeTeamPlayerData as Player[] | undefined;
	const awayTeamPlayerInformation = awayTeamPlayerData as Player[] | undefined;

	// Handle edit mode population
	useEffect(() => {
		if (mentionEditMode && currentEditingMention) {
			setSelectedMentionData({
				mentionCode: currentEditingMention.code,
				desc: currentEditingMention.desc,
				points: currentEditingMention.points.toString(),
				mentionBasis: "",
			});
			setMentionPoints(currentEditingMention.points);
			setMentionCount(currentEditingMention.count || 0);
			setMentionNotes(currentEditingMention.notes || "");
		}
	}, [mentionEditMode, currentEditingMention]);

	// Use renderSeasonCode if provided
	useEffect(() => {
		if (renderSeasonCode) {
			setSeasonCode(renderSeasonCode);
			setCurrentSeason(false); // Disable current season checkbox when season code is provided
			setSeasonSelected(false); // Allow week selection

			// Reset state
			// clear selection
			setMatchSelected(false);
			setSelectedHomeLetter("");
			setSelectedAwayLetter("");
		}
	}, [renderSeasonCode]); 

	// Removed legacy formatted score data syncing

	// Event handlers
	const handleDataChange = () => {
		setIsDataChanged(true);
	};

	// Week selector handler: incoming value may be like 'Date3'; normalize to just numeric '3'
	const handleDateToDisplay = (value: string) => {
		if (!confirmPendingChanges()) return;
		const numeric = value.match(/\d+/)?.[0] || value; // fallback if pattern changes
		setSelectedWeek(numeric);
		// Clear selected matchup when week changes
		setMatchSelected(false);
		setSelectedHomeLetter("");
		setSelectedAwayLetter("");
		setSelectedDivision("");
		setSelectedSubdivision("");
		setSelectedHomeTeamId("");
		setSelectedAwayTeamId("");
		setHomeTeamGameData({});
		setAwayTeamGameData({});
		setHomeWins(Array(11).fill(false));
		setHomePoints(Array(11).fill(""));
		setAwayPoints(Array(11).fill(""));
		setHomePenalties({});
		setAwayPenalties({});
		setIsMatchupCompleted(false);
		setIsDataChanged(false);
	};

	// confirmPendingChanges is defined after saveMatchup to avoid TDZ issues

// Placeholder; actual definition moved below after confirmPendingChanges
// Temporary noop; real implementation defined after confirmPendingChanges
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let handleSeasonCodeSelect = (_value: string) => {};
// Forward declare to avoid TDZ when referenced in early handlers
// Will be defined after saveMatchup; use function hoisting-safe placeholder
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const confirmPendingChangesPlaceholder = () => true;

	// Penalty totals & point calculation (moved above saveMatchup to avoid TDZ)
	const [homePenaltyTotal, setHomePenaltyTotal] = useState<number>(0);
	const [awayPenaltyTotal, setAwayPenaltyTotal] = useState<number>(0);
	useEffect(() => {
		const total = Object.values(homePenalties).reduce((sum, p) => sum + (p.points || 0), 0);
		setHomePenaltyTotal(total);
	}, [homePenalties]);
	useEffect(() => {
		const total = Object.values(awayPenalties).reduce((sum, p) => sum + (p.points || 0), 0);
		setAwayPenaltyTotal(total);
	}, [awayPenalties]);
	const calculatePoints = useCallback(() => {
		const totalHomeWins = homeWins.filter(Boolean).length;
		const rawHomePoints = totalHomeWins;
		const rawAwayPoints = 11 - totalHomeWins;
		const finalHomePoints = Math.max(0, rawHomePoints - (homePenaltyTotal || 0));
		const finalAwayPoints = Math.max(0, rawAwayPoints - (awayPenaltyTotal || 0));
		return {
			rawHomePoints,
			rawAwayPoints,
			homePenaltyPoints: homePenaltyTotal || 0,
			awayPenaltyPoints: awayPenaltyTotal || 0,
			finalHomePoints,
			finalAwayPoints,
		};
	}, [homeWins, homePenaltyTotal, awayPenaltyTotal]);

	// Handle matchup selection from SideNav is defined later after confirmPendingChanges

	const deepEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
	const saveMatchup = useCallback(async (markComplete: boolean = false) => {
		if (!seasonCode || !selectedWeek || !selectedDivision || !selectedSubdivision) return;
		if (!selectedHomeTeamId || !selectedAwayTeamId) return;
		try {
			const tasks: Promise<unknown>[] = [];
			const last = lastSavedSnapshot;
			const homePenChanged = !last || !deepEqual(homePenalties, last.Home.penalties);
			const awayPenChanged = !last || !deepEqual(awayPenalties, last.Away.penalties);
			if (homePenChanged) {
				tasks.push(
					saveTeamInfoMutation.mutateAsync({
						seasonCode,
						weekNum: parseInt(selectedWeek),
						division: selectedDivision,
						subdivision: selectedSubdivision,
						home: true,
						teamId: selectedHomeTeamId,
						teamName: homeTeamInformation?.teamName || "",
						teamLetter: selectedHomeLetter,
						opposingTeamId: selectedAwayTeamId,
						penalties: homePenalties,
					})
				);
			}
			if (awayPenChanged) {
				tasks.push(
					saveTeamInfoMutation.mutateAsync({
						seasonCode,
						weekNum: parseInt(selectedWeek),
						division: selectedDivision,
						subdivision: selectedSubdivision,
						home: false,
						teamId: selectedAwayTeamId,
						teamName: awayTeamInformation?.teamName || "",
						teamLetter: selectedAwayLetter,
						opposingTeamId: selectedHomeTeamId,
						penalties: awayPenalties,
					})
				);
			}

			// Build per-game info for 11 games
			const gameInfo: Record<string, { homeWin: boolean; homePoints: string; awayPoints: string }> = {};
			for (let i = 0; i < 11; i++) {
				const gameKey = `Game ${i + 1}`;
				gameInfo[gameKey] = {
					homeWin: !!homeWins[i],
					homePoints: homePoints[i] || "0",
					awayPoints: awayPoints[i] || "0",
				};
			}

			const totals = calculatePoints();
			const gameInfoChanged = !last || !deepEqual(last.Home.wins, homeWins) || !deepEqual(last.Home.points, homePoints) || !deepEqual(last.Away.points, awayPoints) || (!!markComplete !== !!last.completed);
			if (gameInfoChanged) {
				// Save granular game info
				tasks.push(
					saveGameInfoMutation.mutateAsync({
						seasonCode,
						weekNum: parseInt(selectedWeek),
						division: selectedDivision,
						subdivision: selectedSubdivision,
						homeTeamId: selectedHomeTeamId,
						awayTeamId: selectedAwayTeamId,
						homePoints: totals.finalHomePoints,
						awayPoints: totals.finalAwayPoints,
						completed: !!markComplete,
						gameInfo,
					})
				);
				// Also persist legacy cumulative team weekly points to keep historical leaderboards in sync
				tasks.push(
					saveWeeklyTeamPointsMutation.mutateAsync({
						seasonCode,
						weekNum: parseInt(selectedWeek),
						ledaId: selectedHomeTeamId,
						totalPoints: totals.finalHomePoints,
					})
				);
				tasks.push(
					saveWeeklyTeamPointsMutation.mutateAsync({
						seasonCode,
						weekNum: parseInt(selectedWeek),
						ledaId: selectedAwayTeamId,
						totalPoints: totals.finalAwayPoints,
					})
				);
			}

			// Save player participation for each player (home and away)
			Object.entries(homeTeamGameData).forEach(([playerId, gameStats]) => {
				const before = last?.Home.teamGameData?.[playerId] || {};
				if (!deepEqual(before, gameStats)) {
					// Persist granular participation stats
					tasks.push(
						savePlayerPointsMutation.mutateAsync({
							seasonCode,
							weekNum: parseInt(selectedWeek),
							division: selectedDivision,
							subdivision: selectedSubdivision,
							ledaId: playerId,
							teamId: selectedHomeTeamId,
							gameStats: gameStats as Record<string, boolean>,
						})
					);
					// Also upsert legacy cumulative player weekly points
					const weeklyPoints = Object.values(gameStats).filter(Boolean).length; // assumption metric
					tasks.push(
						saveWeeklyPlayerPointsMutation.mutateAsync({
							seasonCode,
							weekNum: parseInt(selectedWeek),
							ledaId: playerId,
							teamLedaId: selectedHomeTeamId,
							totalPoints: weeklyPoints,
						})
					);
				}
			});
			Object.entries(awayTeamGameData).forEach(([playerId, gameStats]) => {
				const before = last?.Away.teamGameData?.[playerId] || {};
				if (!deepEqual(before, gameStats)) {
					tasks.push(
						savePlayerPointsMutation.mutateAsync({
							seasonCode,
							weekNum: parseInt(selectedWeek),
							division: selectedDivision,
							subdivision: selectedSubdivision,
							ledaId: playerId,
							teamId: selectedAwayTeamId,
							gameStats: gameStats as Record<string, boolean>,
						})
					);
					const weeklyPoints = Object.values(gameStats).filter(Boolean).length;
					tasks.push(
						saveWeeklyPlayerPointsMutation.mutateAsync({
							seasonCode,
							weekNum: parseInt(selectedWeek),
							ledaId: playerId,
							teamLedaId: selectedAwayTeamId,
							totalPoints: weeklyPoints,
						})
					);
				}
			});
			if (tasks.length === 0) { setIsDataChanged(false); return; }
			await Promise.all(tasks);

			setIsDataChanged(false);
			if (markComplete) setIsMatchupCompleted(true);
			const newSnap = {
				Home: { teamGameData: JSON.parse(JSON.stringify(homeTeamGameData)), wins: [...homeWins], points: [...homePoints], penalties: JSON.parse(JSON.stringify(homePenalties)) },
				Away: { teamGameData: JSON.parse(JSON.stringify(awayTeamGameData)), points: [...awayPoints], penalties: JSON.parse(JSON.stringify(awayPenalties)) },
				completed: !!markComplete,
			};
			setLastSavedSnapshot(newSnap);
			if (!originalMatchupSnapshot) setOriginalMatchupSnapshot(newSnap);
		} catch (err) {
			console.error("Error saving matchup", err);
		}
	}, [seasonCode, selectedWeek, selectedDivision, selectedSubdivision, selectedHomeTeamId, selectedAwayTeamId, homeTeamInformation, awayTeamInformation, selectedHomeLetter, selectedAwayLetter, homePenalties, awayPenalties, homeWins, homePoints, awayPoints, calculatePoints, saveTeamInfoMutation, saveGameInfoMutation, homeTeamGameData, awayTeamGameData, savePlayerPointsMutation, saveWeeklyTeamPointsMutation, saveWeeklyPlayerPointsMutation, originalMatchupSnapshot, lastSavedSnapshot]);
		
	// removed stray fragment from prior handler

	const handleGameToggle = (
		teamType: "home" | "away",
		playerId: string,
		gameIndex: number
	) => {
		const gameKey = `Game ${gameIndex + 1}`;

		if (teamType === "home") {
			setHomeTeamGameData((prev) => {
				const playerData = prev[playerId] || {};
				return {
					...prev,
					[playerId]: {
						...playerData,
						[gameKey]: !playerData[gameKey],
					},
				};
			});
		} else {
			setAwayTeamGameData((prev) => {
				const playerData = prev[playerId] || {};
				return {
					...prev,
					[playerId]: {
						...playerData,
						[gameKey]: !playerData[gameKey],
					},
				};
			});
		}
		handleDataChange();
	};

	const handleHomeWinToggle = (gameIndex: number) => {
		setHomeWins((prev) => {
			const newWins = [...prev];
			newWins[gameIndex] = !newWins[gameIndex];
			return newWins;
		});
		handleDataChange();
	};


    // (moved up)

	const handleHomePointsChange = (gameIndex: number, value: string) => {
		setHomePoints((prev) => {
			const newPoints = [...prev];
			newPoints[gameIndex] = value;
			return newPoints;
		});
		handleDataChange();
	};

	const handleAwayPointsChange = (gameIndex: number, value: string) => {
		setAwayPoints((prev) => {
			const newPoints = [...prev];
			newPoints[gameIndex] = value;
			return newPoints;
		});
		handleDataChange();
	};

	// removed legacy saveMatchup implementation

	// Now that saveMatchup exists, define confirmPendingChanges depending on it
	const confirmPendingChanges = useCallback((): boolean => {
		if (!isDataChanged) return true;
		const choice = window.prompt(
			"You have unsaved changes. Enter 1 to Save, 2 to Save & Mark Complete, 3 to Discard.",
			"1"
		);
		if (choice === null) return false; // cancel
		if (choice === "1") {
			saveMatchup(false);
			return true;
		}
		if (choice === "2") {
			saveMatchup(true);
		}
		if (choice === "3") {
			setIsDataChanged(false);
			return true;
		}
		window.alert("Invalid selection; action cancelled.");
		return false;
	}, [isDataChanged, saveMatchup]);

	// Define matchup selection handler now that confirmPendingChanges exists
	const handleMatchupSelection = useCallback(async (
		homeLetter: string,
		awayLetter: string,
		divisionName: string,
		subdivisionName: string
	) => {
		if (!seasonCode || !selectedWeek) return;
		// guard unsaved changes
		if (!confirmPendingChanges()) return;
		setSelectedHomeLetter(homeLetter);
		setSelectedAwayLetter(awayLetter);
		setSelectedDivision(divisionName);
		setSelectedSubdivision(subdivisionName);
		setMatchSelected(true);
		// reset baseline tracking for new matchup
		setBaselineInitialized(false);
		setLastSavedSnapshot(null);
		setHomeHydrated(false);
		setAwayHydrated(false);
		try {
			const teamRows = await fetchTeamInfoV2({
				seasonCode,
				weekNum: selectedWeek,
				division: divisionName,
				subdivision: subdivisionName,
				teamLetter: homeLetter,
			});
			// Reset local state when switching matchups
			setHomeTeamGameData({});
			setAwayTeamGameData({});
			setHomeWins(Array(11).fill(false));
			setHomePoints(Array(11).fill(""));
			setAwayPoints(Array(11).fill(""));
			setIsMatchupCompleted(false);
			setIsDataChanged(false);
			setOriginalMatchupSnapshot(null);
			setLastSavedSnapshot(null);
			setBaselineInitialized(false);

			let homeTeamId = "";
			let awayTeamId = "";

			if (teamRows === null) {
				// 204 response - matchup doesn't exist yet, fetch team IDs from roster
				const subdivisionNum = subdivisionName.replace('Subdivision ', '');
				
				const homeTeamIdResult = await fetchRosterTeamId({
					seasonCode,
					division: divisionName,
					subdivision: subdivisionNum,
					teamLetter: homeLetter,
				});
				
				const awayTeamIdResult = await fetchRosterTeamId({
					seasonCode,
					division: divisionName,
					subdivision: subdivisionNum,
					teamLetter: awayLetter,
				});

				if (homeTeamIdResult && awayTeamIdResult) {
					homeTeamId = homeTeamIdResult;
					awayTeamId = awayTeamIdResult;
					setSelectedHomeTeamId(homeTeamId);
					setSelectedAwayTeamId(awayTeamId);
					setHomePenalties({});
					setAwayPenalties({});
					
					// Initialize with blank game data since matchup doesn't exist
					setHomeWins(Array(11).fill(false));
					setHomePoints(Array(11).fill("0"));
					setAwayPoints(Array(11).fill("0"));
					setIsMatchupCompleted(false);
				} else {
					// Could not find team IDs in roster
					setSelectedHomeTeamId("");
					setSelectedAwayTeamId("");
					setHomePenalties({});
					setAwayPenalties({});
				}
			} else if (Array.isArray(teamRows) && teamRows.length >= 2) {
				homeTeamId = String(teamRows[0].teamId);
				awayTeamId = String(teamRows[1].teamId);
				setSelectedHomeTeamId(homeTeamId);
				setSelectedAwayTeamId(awayTeamId);
				setHomePenalties(teamRows[0]?.penalties || {});
				setAwayPenalties(teamRows[1]?.penalties || {});

				// Hydrate existing game info
				const giRows = await fetchGameInfoV2({
					seasonCode,
					weekNum: selectedWeek,
					division: divisionName,
					subdivision: subdivisionName,
					homeTeamId,
					awayTeamId,
				});
				
				if (giRows === null) {
					// 204 response - matchup doesn't exist yet, initialize with blank data
					setHomeWins(Array(11).fill(false));
					setHomePoints(Array(11).fill("0"));
					setAwayPoints(Array(11).fill("0"));
					setIsMatchupCompleted(false);
				} else if (Array.isArray(giRows) && giRows.length > 0) {
					const gi = giRows[0];
					const gameInfo = gi?.gameInfo as Record<string, { homeWin: boolean; homePoints: string; awayPoints: string }> | undefined;
					if (gameInfo) {
						const newWins = Array(11).fill(false).map((_, i) => !!gameInfo[`Game ${i + 1}`]?.homeWin);
						const newHomePoints = Array(11).fill("").map((_, i) => gameInfo[`Game ${i + 1}`]?.homePoints ?? "0");
						const newAwayPoints = Array(11).fill("").map((_, i) => gameInfo[`Game ${i + 1}`]?.awayPoints ?? "0");
						setHomeWins(newWins);
						setHomePoints(newHomePoints);
						setAwayPoints(newAwayPoints);
					}
					setIsMatchupCompleted(!!gi?.completed);
				} else {
					// Empty array or unexpected response - initialize with blank data
					setHomeWins(Array(11).fill(false));
					setHomePoints(Array(11).fill("0"));
					setAwayPoints(Array(11).fill("0"));
					setIsMatchupCompleted(false);
				}
			} else {
				setSelectedHomeTeamId("");
				setSelectedAwayTeamId("");
				setHomePenalties({});
				setAwayPenalties({});
			}
			// Force refetch of player game-stats queries for this matchup
			setMatchupLoadToken(prev => prev + 1);
		} catch (e) {
			console.error("Failed to load matchup team info", e);
		}
	// fetchTeamInfoV2 & fetchGameInfoV2 are stable local functions; exclude from deps to satisfy lint
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [seasonCode, selectedWeek, confirmPendingChanges]);

	// establish baseline snapshot once roster/game data hydrated for both teams
	useEffect(() => {
		if (!matchSelected) return;
		if (baselineInitialized) return;
		if (!homeHydrated || !awayHydrated) return;
		const snap = {
			Home: { teamGameData: JSON.parse(JSON.stringify(homeTeamGameData)), wins: [...homeWins], points: [...homePoints], penalties: JSON.parse(JSON.stringify(homePenalties)) },
			Away: { teamGameData: JSON.parse(JSON.stringify(awayTeamGameData)), points: [...awayPoints], penalties: JSON.parse(JSON.stringify(awayPenalties)) },
			completed: isMatchupCompleted,
		};
		setOriginalMatchupSnapshot(snap);
		setLastSavedSnapshot(snap);
		setBaselineInitialized(true);
	}, [matchSelected, baselineInitialized, homeHydrated, awayHydrated, homeTeamGameData, awayTeamGameData, homeWins, homePoints, awayPoints, homePenalties, awayPenalties, isMatchupCompleted]);

	// Implement season code selection handler now that confirmPendingChanges exists
	handleSeasonCodeSelect = (value: string) => {
		if (!confirmPendingChanges()) return;
		setSeasonCode(value);
		setSeasonSelected(false);

		// Reset state when season changes
		setSelectedWeek("");
		// clear selection
		setMatchSelected(false);
		setSelectedHomeLetter("");
		setSelectedAwayLetter("");
		setSelectedDivision("");
		setSelectedSubdivision("");
		setSelectedHomeTeamId("");
		setSelectedAwayTeamId("");
		setHomeTeamGameData({});
		setAwayTeamGameData({});
		setHomeWins(Array(11).fill(false));
		setHomePoints(Array(11).fill(""));
		setAwayPoints(Array(11).fill(""));
		setHomePenaltyCounter(0);
		setAwayPenaltyCounter(0);
		setMentionCounters({});
	};

	// Process mention history using React Query mutations
	// Note: processMentionHistory function was removed since mentions are now
	// saved directly to the database when users add/edit/delete them

	// Legacy resetScoresheet fully removed (was replaced by explicit Reset Changes & Delete actions)

	// ensureBaselineForMatchup removed (baselines now implicit via save + probing)

	const handlePenaltyClick = (
		teamId: string,
		teamName: string | undefined,
		isHome: boolean
	) => {
		// Set the selected team information for penalties
		setSelectedPenaltyTeamId(teamId);
		setSelectedPenaltyTeamName(teamName || "");

		// Open the appropriate dialog
		if (isHome) {
			setHomePenaltyDialogOpen(true);
		} else {
			setAwayPenaltyDialogOpen(true);
		}
	};

    const handlePenaltySubmit = (
        teamId: string,
        penaltyCode: string,
        points: number,
        notes?: string
    ) => {
        const isHomeTeam = teamId === selectedHomeTeamId;
        const nextCounter = isHomeTeam ? homePenaltyCounter + 1 : awayPenaltyCounter + 1;
        const penaltyObj = { penaltyCode, points, notes: notes || "" };
        if (isHomeTeam) {
            setHomePenalties((prev) => ({ ...prev, [nextCounter]: penaltyObj }));
            setHomePenaltyCounter(nextCounter);
        } else {
            setAwayPenalties((prev) => ({ ...prev, [nextCounter]: penaltyObj }));
            setAwayPenaltyCounter(nextCounter);
        }
        if (isHomeTeam) setHomePenaltyDialogOpen(false); else setAwayPenaltyDialogOpen(false);
        handleDataChange();
    };

	const handlePenaltyEditing = (teamId: string, penaltyId: string) => {
		const isHomeTeam = teamId === selectedHomeTeamId;
		const penalties = isHomeTeam ? homePenalties : awayPenalties;
		const penalty = penalties[penaltyId];
		if (!penalty) return;
		setPenaltyEditMode(true);
		setCurrentEditingPenalty({
			id: penaltyId,
			code: penalty.penaltyCode,
			points: penalty.points,
			notes: penalty.notes || "",
		});
		setSelectedPenaltyTeamId(teamId);
		setSelectedPenaltyTeamName(
			isHomeTeam ? homeTeamInformation?.teamName || "" : awayTeamInformation?.teamName || ""
		);
		if (isHomeTeam) setHomePenaltyDialogOpen(true); else setAwayPenaltyDialogOpen(true);
	};

	const updatePenalty = (
		teamId: string,
		penaltyId: string,
		newCode: string,
		points: number,
		notes?: string
	) => {
		const isHomeTeam = teamId === selectedHomeTeamId;
		const setFn = isHomeTeam ? setHomePenalties : setAwayPenalties;
		setFn((prev) => ({
			...prev,
			[penaltyId]: { penaltyCode: newCode, points, notes: notes || "" },
		}));
		setPenaltyEditMode(false);
		setCurrentEditingPenalty(null);
		setHomePenaltyDialogOpen(false);
		setAwayPenaltyDialogOpen(false);
		handleDataChange();
	};

	const handlePenaltyRemoval = (teamId: string, penaltyId: string) => {
		if (!window.confirm("Delete this penalty?")) return;
		const isHomeTeam = teamId === selectedHomeTeamId;
		const setFn = isHomeTeam ? setHomePenalties : setAwayPenalties;
		setFn((prev) => {
			const clone = { ...prev };
			delete clone[penaltyId];
			return clone;
		});
		handleDataChange();
	};

	const handleMentionClick = async (playerId: string, teamId: string) => {
		// Find the player name based on the ID
		let playerName = "";
		let teamName = "";

		if (teamId === selectedHomeTeamId) {
			const player = homeTeamPlayerInformation?.find(
				(p) => String(p.ledaId) === playerId
			);
			playerName = player?.fullName || "";
			teamName = homeTeamInformation?.teamName || "";
		} else {
			const player = awayTeamPlayerInformation?.find(
				(p) => String(p.ledaId) === playerId
			);
			playerName = player?.fullName || "";
			teamName = awayTeamInformation?.teamName || "";
		}

		// Set the selected player for mention
		setSelectedPlayerForMention({
			id: playerId,
			name: playerName,
			teamId: teamId,
			teamName: teamName,
		});

		// Fetch mentions for this player only when the dialog is opened
		if (seasonCode && selectedWeek && teamId && playerId) {
			try {
				const response = await fetch(
					`/api/maintenance/mention/mentionHistory?ledaId=${playerId}&seasonCode=${seasonCode}&weekNum=${selectedWeek}&teamId=${teamId}`
				);
				if (response.ok) {
					const mentions = await response.json();
					setCurrentPlayerMentions(mentions);
					
					// Update mention counter to account for existing mentions from database
					if (mentions && mentions.length > 0) {
						const existingMentionIds = mentions
							.map((mention: MentionPlayerHistory) => parseInt(mention.mentionId))
							.filter((id: number) => !isNaN(id));
						
						if (existingMentionIds.length > 0) {
							const maxExistingId = Math.max(...existingMentionIds);
							const playerMentionKey = `${teamId}-${playerId}`;
							setMentionCounters(prev => ({
								...prev,
								[playerMentionKey]: Math.max(prev[playerMentionKey] || 0, maxExistingId)
							}));
						}
					}
				} else {
					setCurrentPlayerMentions([]);
				}
			} catch {
				setCurrentPlayerMentions([]);
			}
		} else {
			setCurrentPlayerMentions([]);
		}

		setMentionDialogOpen(true);
	};

	const handleMentionEditing = (
		playerId: string,
		teamId: string,
		mentionId: string
	) => {
		if (!currentPlayerMentions) return;

		// Find the mention in the current player mentions array
		const mention = currentPlayerMentions.find(
			(m) => m.mentionId === mentionId
		);

		if (mention) {
			// Set up the editing state
			setMentionEditMode(true);
			setCurrentEditingMention({
				id: mentionId,
				code: mention.mentionCode,
				desc: mention.mentionDesc,
				points: mention.mentionPoints,
				notes: mention.notes || "",
				count: mention.count || 0,
			});

			// Find the player name based on the ID
			let playerName = "";
			let teamName = "";

			if (teamId === selectedHomeTeamId) {
				const player = homeTeamPlayerInformation?.find(
					(p) => String(p.ledaId) === playerId
				);
				playerName = player?.fullName || "";
				teamName = homeTeamInformation?.teamName || "";
			} else {
				const player = awayTeamPlayerInformation?.find(
					(p) => String(p.ledaId) === playerId
				);
				playerName = player?.fullName || "";
				teamName = awayTeamInformation?.teamName || "";
			}

			// Set the selected player for mention
			setSelectedPlayerForMention({
				id: playerId,
				name: playerName,
				teamId: teamId,
				teamName: teamName,
			});

			// Open the mention dialog
			setMentionDialogOpen(true);
		}
	};

	const updateMention = async (
		mentionId: string,
		mentionCode: string,
		desc: string,
		points: number,
		count: number,
		notes?: string
	) => {
		if (!selectedPlayerForMention || !currentPlayerMentions || !seasonCode || !selectedWeek) return;

		const playerId = selectedPlayerForMention.id;
		const teamId = selectedPlayerForMention.teamId;

		try {
			// Update the mention directly in the database
			await updateMentionHistoryMutation.mutateAsync({
				ledaId: playerId,
				mentionId: mentionId,
				mentionCode: mentionCode,
				mentionDesc: desc,
				mentionPoints: points,
				seasonCode: seasonCode,
				weekNum: typeof selectedWeek === 'string' ? parseInt(selectedWeek) : selectedWeek,
				notes: notes || "",
				count: count || 0,
				teamId: teamId,
			});

			// Update the current player mentions to reflect the changes
			const updatedMentions = currentPlayerMentions.map((mention) =>
				mention.mentionId === mentionId
					? {
							...mention,
							mentionCode: mentionCode,
							mentionDesc: desc,
							mentionPoints: points,
							notes: notes || "",
							count: count || 0,
					  }
					: mention
			);
			setCurrentPlayerMentions(updatedMentions);

			// Reset editing state
			setMentionEditMode(false);
			setCurrentEditingMention(null);

			// Intentionally does not toggle unsaved-change flag; mention updates persist immediately
		} catch (error) {
			console.error("Failed to update mention:", error);
			// Could show a toast notification here
		}
	};

	const handleMentionSubmit = async (
		mentionCode: string,
		desc: string,
		points: number,
		count: number,
		notes?: string
	) => {
		console.log("handleMentionSubmit called with:", { mentionCode, desc, points, count, notes });
		console.log("selectedPlayerForMention:", selectedPlayerForMention);
		console.log("seasonCode:", seasonCode);
		console.log("selectedWeek:", selectedWeek);
		
		if (!selectedPlayerForMention || !seasonCode || !selectedWeek) {
			console.log("Missing required data, returning early");
			return;
		}

		const playerId = selectedPlayerForMention.id;
		const teamId = selectedPlayerForMention.teamId;

		// Get or initialize mention counter for this player
		const playerMentionKey = `${teamId}-${playerId}`;
		let currentCounter = mentionCounters[playerMentionKey] || 0;
		
		// Also check existing mentions in currentPlayerMentions to ensure proper sequencing
		if (currentPlayerMentions && currentPlayerMentions.length > 0) {
			const existingMentionIds = currentPlayerMentions
				.filter(mention => 
					mention.ledaId === playerId && 
					mention.teamId != null && 
					mention.teamId.toString() === teamId
				)
				.map(mention => parseInt(mention.mentionId))
				.filter(id => !isNaN(id));
			
			if (existingMentionIds.length > 0) {
				const maxExistingId = Math.max(...existingMentionIds);
				currentCounter = Math.max(currentCounter, maxExistingId);
			}
		}
		
		const newCounter = currentCounter + 1;

		// Update the mention counter state
		setMentionCounters({
			...mentionCounters,
			[playerMentionKey]: newCounter,
		});

		try {
			// Add the mention directly to the database
			console.log("Calling createMentionHistoryMutation with:", {
				ledaId: playerId,
				mentionId: newCounter.toString(),
				mentionCode: mentionCode,
				mentionDesc: desc,
				mentionPoints: points,
				seasonCode: seasonCode,
				weekNum: typeof selectedWeek === 'string' ? parseInt(selectedWeek) : selectedWeek,
				notes: notes || "",
				count: count || 0,
				teamId: teamId,
			});
			
			const result = await createMentionHistoryMutation.mutateAsync({
				ledaId: playerId,
				mentionId: newCounter.toString(),
				mentionCode: mentionCode,
				mentionDesc: desc,
				mentionPoints: points,
				seasonCode: seasonCode,
				weekNum: typeof selectedWeek === 'string' ? parseInt(selectedWeek) : selectedWeek,
				notes: notes || "",
				count: count || 0,
				teamId: teamId,
			});
			
			console.log("Mutation result:", result);

			// Add the new mention to currentPlayerMentions for UI display
			if (currentPlayerMentions && selectedPlayerForMention) {
				const newMention: MentionPlayerHistory = {
					mentionId: newCounter.toString(),
					ledaId: selectedPlayerForMention.id,
					mentionCode: mentionCode,
					mentionDesc: desc,
					mentionPoints: points,
					notes: notes || "",
					count: count || 0,
					seasonCode: seasonCode,
					weekNum: typeof selectedWeek === 'string' ? parseInt(selectedWeek) : selectedWeek || 1,
					teamId: parseInt(selectedPlayerForMention.teamId),
				};
				setCurrentPlayerMentions([...currentPlayerMentions, newMention]);
			}

			// Intentionally does not mark data dirty; mention additions persist immediately
			console.log("Mention added successfully!");
		} catch (error) {
			console.error("Failed to add mention:", error);
			console.error("Error details:", error);
			// Could show a toast notification here
		}
	};

	const handleMentionDelete = async (
		playerId: string,
		teamId: string,
		mentionId: string
	) => {
		if (!currentPlayerMentions || !seasonCode || !selectedWeek) return;

		// Add confirmation dialog
		if (
			!window.confirm(
				`Are you sure you want to delete this mention? This action cannot be undone.`
			)
		) {
			return; // Exit if user cancels
		}

		try {
			// Delete the mention directly from the database
			await deleteMentionHistoryMutation.mutateAsync({
				ledaId: playerId,
				mentionId: mentionId,
				seasonCode: seasonCode,
				weekNum: typeof selectedWeek === 'string' ? parseInt(selectedWeek) : selectedWeek,
				mentionCode: "", // Required by API but not used for deletion
				mentionDesc: "",
				mentionPoints: 0,
				notes: "",
				teamId: teamId,
			});

			// Update the current player mentions to reflect the deletion
			const updatedMentions = currentPlayerMentions.filter(
				(mention) => mention.mentionId !== mentionId
			);
			setCurrentPlayerMentions(updatedMentions);

			// Intentionally does not mark data dirty; deletion already persisted
		} catch (error) {
			console.error("Failed to delete mention:", error);
			// Could show a toast notification here
		}
	};

	// Warn on page unload if there are unsaved changes
	useEffect(() => {
		const handler = (e: BeforeUnloadEvent) => {
			if (isDataChanged) {
				e.preventDefault();
				e.returnValue = "You have unsaved changes.";
			}
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isDataChanged]);

	// UI skeleton for loading state
	const FolderTabSkeleton = () => (
		<div className="w-full space-y-4">
			<Skeleton className="h-8 w-2/3" />
			<Skeleton className="h-6 w-1/2 mb-4" />
			<Skeleton className="h-8 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
		</div>
	);

	return (
		<div className="flex flex-col h-full">
			<FolderTabMed title="Season Information" className="w-fit">
				<div className="flex gap-4">
					<SeasonCodeSelector
						disabled={currentSeason}
						handleSelect={handleSeasonCodeSelect}
						useCurrentSeason={currentSeason}
						seasonCode={seasonCode || ""}
					/>
					<div className="flex items-center gap-4">
						<Label>Current Season?</Label>
						<Checkbox
							checked={currentSeason}
							onCheckedChange={() =>
								setCurrentSeason(!currentSeason)
							}
						/>
					</div>
					<div className="flex gap-4">
						<WeekSelector
							seasonCode={seasonCode}
							disabled={seasonSelected}
							handleSelect={handleDateToDisplay}
						/>
					</div>
				</div>
			</FolderTabMed>
			<div className="mt-4">
				<Separator
					orientation="horizontal"
					className="bg-gray-400 w-100"
				/>
			</div>
			<div className="flex flex-1 overflow-hidden">
				<SideNav
					key={`${seasonCode}-${selectedWeek}`}
					seasonCode={seasonCode}
					weekNum={selectedWeek}
					handleMatchupSelection={handleMatchupSelection}
				/>
				<div className="flex-1 p-4 overflow-auto">
					{!matchSelected ? (
						<div className="flex h-full items-center justify-center">
							<p className="text-gray-500 text-center">
								Select a matchup...
							</p>
						</div>
					) : (
						<div className="flex h-full items-start justify-start gap-2 flex-col">
							<div className="flex flex-col gap-4 w-full">
								<div className="text-2xl font-semibold">
									{selectedDivision}
								</div>
								<div className="text-xl font-semibold">
									{selectedSubdivision}
								</div>
								<div>
									Matchup for {selectedHomeLetter} vs{" "}
									{selectedAwayLetter}
								</div>
								{isLoading ? (
									<>
										<FolderTab title="Home">
											<FolderTabSkeleton />
										</FolderTab>
										<FolderTab title="Away">
											<FolderTabSkeleton />
										</FolderTab>
										<FolderTab title="Game Points">
											<FolderTabSkeleton />
										</FolderTab>
									</>
								) : (
									<>
								<FolderTab title="Home">
									{isLoading || !homeTeamPlayerInformation ? (
										<FolderTabSkeleton />
									) : (
										<>
											<div className="text-lg font-bold text-gray-800">
												Team Name:{" "}
												{homeTeamInformation?.teamName}
											</div>
											<div className="text-lg font-semibold text-gray-800">
												Team ID: {selectedHomeTeamId}
											</div>
											<div className="text-md text-gray-600 mb-4">
												Team Letter:{" "}
												{selectedHomeLetter}
											</div>
											<div>
												<Dialog
													open={homePenaltyDialogOpen}
													onOpenChange={(open) => {
														setHomePenaltyDialogOpen(
															open
														);
														if (!open) {
															setPenaltyEditMode(
																false
															);
															setCurrentEditingPenalty(
																null
															);
														}
													}}
												>
													<DialogTrigger asChild>
														<Button
															variant="outline"
															className="text-sm px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100"
															onClick={() =>
																handlePenaltyClick(
																	selectedHomeTeamId,
																	homeTeamInformation?.teamName,
																	true
																)
															}
														>
															<span>
																Penalties
															</span>
														</Button>
													</DialogTrigger>
													<DialogContent className="w-fit bg-white">
														<DialogHeader>
															<DialogTitle className="flex justify-center">
																{penaltyEditMode
																	? "Edit"
																	: "Add"}{" "}
																Penalty for
																Team:{" "}
																{
																	selectedPenaltyTeamName
																}
															</DialogTitle>
														</DialogHeader>
														<PenaltyAddForm
															setOpen={
																setHomePenaltyDialogOpen
															}
															selectedTeamId={
																selectedPenaltyTeamId
															}
															handlePenaltySubmit={
																handlePenaltySubmit
															}
															isEditMode={
																penaltyEditMode
															}
															initialPenalty={
																currentEditingPenalty
															}
															updatePenalty={
																updatePenalty
															}
														/>
													</DialogContent>
												</Dialog>
												{/* Penalties Accordion for Home Team - Only render if penalties exist */}
												{Object.keys(homePenalties).length > 0 && (
														<Accordion
															type="single"
															collapsible
															className="w-full mt-2"
														>
															<AccordionItem value="penalties">
																<AccordionTrigger className="text-sm font-medium text-red-600">
																	View Team
																	Penalties
																</AccordionTrigger>
																<AccordionContent>
																	<div className="space-y-2 p-2 border rounded-md">
																		{Object.entries(homePenalties).map(
																			([
																				id,
																				penalty,
																			]) => (
																				<div
																					key={
																						id
																					}
																					className="flex justify-between items-start border-b pb-2 group relative"
																				>
																					<div>
																						<span className="font-semibold">
																							Code:{" "}
																							{
																								penalty.penaltyCode
																							}
																						</span>
																						<p className="text-sm text-gray-600">
																							{
																								penalty.notes
																							}
																						</p>
																					</div>
																					<div className="flex items-center">
																						<span className="text-red-600 font-bold">
																							{
																								penalty.points
																							}{" "}
																							pts
																						</span>
																						<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
																							<Pencil
																								className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
																								onClick={() =>
																									handlePenaltyEditing(
																										selectedHomeTeamId,
																										id
																									)
																								}
																							/>
																							<X
																								className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
																								onClick={() =>
																									handlePenaltyRemoval(
																										selectedHomeTeamId,
																										id
																									)
																								}
																							/>
																						</div>
																					</div>
																				</div>
																			)
																		)}
																	</div>
																</AccordionContent>
															</AccordionItem>
														</Accordion>
													)}
											</div>
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>
																Player Name
															</TableHead>
															<TableHead />
															{Array.from({
																length: 11,
															}).map((_, i) => (
																<TableHead
																	key={i}
																	className="text-center"
																>
																	Game {i + 1}
																</TableHead>
															))}
														</TableRow>
													</TableHeader>
													<TableBody>
														{homeTeamPlayerInformation?.map(
															(player) => (
																<TableRow
																	key={
																		player.ledaId
																	}
																>
																	<TableCell className="w-fit flex items-center gap-2">
																		<span>
																			{
																				player.fullName
																			}
																		</span>
																	</TableCell>
																	<TableCell>
																		<Button
																			variant="outline"
																			className="text-xs px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100"
																			onClick={() =>
																				handleMentionClick(
																					String(
																						player.ledaId
																					),
																					selectedHomeTeamId
																				)
																			}
																		>
																			<span>
																				Mentions
																			</span>
																		</Button>
																	</TableCell>
																	{Array.from(
																		{
																			length: 11,
																		}
																	).map(
																		(
																			_,
																			i
																		) => {
																			const gameKey = `Game ${
																				i +
																				1
																			}`;
																			return (
																				<TableCell
																					key={
																						i
																					}
																					className="text-center cursor-pointer"
																					onClick={() =>
																						handleGameToggle(
																							"home",
																							String(
																								player.ledaId
																							),
																							i
																						)
																					}
																				>
																					<div className="border border-dashed border-gray-400 w-8 h-8 mx-auto flex items-center justify-center">
																						{homeTeamGameData[
																							player
																								.ledaId
																						]?.[
																							gameKey
																						] && (
																							<X className="h-5 w-5" />
																						)}
																					</div>
																				</TableCell>
																			);
																		}
																	)}
																</TableRow>
															)
														)}
													</TableBody>
												</Table>
											</div>
										</>
									)}
								</FolderTab>
								<FolderTab title="Away">
									{isLoading || !awayTeamPlayerInformation ? (
										<FolderTabSkeleton />
									) : (
										<>
											<div className="text-lg font-bold text-gray-800">
												Team Name:{" "}
												{awayTeamInformation?.teamName}
											</div>
											<div className="text-lg font-semibold text-gray-800">
												Team ID: {selectedAwayTeamId}
											</div>
											<div className="text-md text-gray-600 mb-4">
												Team Letter:{" "}
												{selectedAwayLetter}
											</div>

											<Dialog
												open={awayPenaltyDialogOpen}
												onOpenChange={(open) => {
													setAwayPenaltyDialogOpen(
														open
													);
													if (!open) {
														setPenaltyEditMode(
															false
														);
														setCurrentEditingPenalty(
															null
														);
													}
												}}
											>
												<DialogTrigger asChild>
													<Button
														variant="outline"
														className="text-sm px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100"
														onClick={() =>
															handlePenaltyClick(
																selectedAwayTeamId,
																awayTeamInformation?.teamName,
																false
															)
														}
													>
														<span>Penalties</span>
													</Button>
												</DialogTrigger>
												<DialogContent className="w-fit bg-white">
													<DialogHeader>
														<DialogTitle>
															{penaltyEditMode
																? "Edit"
																: "Add"}{" "}
															Penalty -{" "}
															{
																selectedPenaltyTeamName
															}
														</DialogTitle>
													</DialogHeader>
													<PenaltyAddForm
														setOpen={
															setAwayPenaltyDialogOpen
														}
														selectedTeamId={
															selectedPenaltyTeamId
														}
														handlePenaltySubmit={
															handlePenaltySubmit
														}
														isEditMode={
															penaltyEditMode
														}
														initialPenalty={
															currentEditingPenalty
														}
														updatePenalty={
															updatePenalty
														}
													/>
												</DialogContent>
											</Dialog>

											{/* Penalties Accordion for Away Team - Only render if penalties exist */}
											{Object.keys(awayPenalties).length > 0 && (
													<Accordion
														type="single"
														collapsible
														className="w-full mt-2"
													>
														<AccordionItem value="penalties">
															<AccordionTrigger className="text-sm font-medium text-red-600">
																View Team
																Penalties
															</AccordionTrigger>
															<AccordionContent>
																<div className="space-y-2 p-2 border rounded-md">
																	{Object.entries(awayPenalties).map(
																		([
																			id,
																			penalty,
																		]) => (
																			<div
																				key={
																					id
																				}
																				className="flex justify-between items-start border-b pb-2 group relative"
																			>
																				<div>
																					<span className="font-semibold">
																						Code:{" "}
																						{
																							penalty.penaltyCode
																						}
																					</span>
																					<p className="text-sm text-gray-600">
																						{
																							penalty.notes
																						}
																					</p>
																				</div>
																				<div className="flex items-center">
																					<span className="text-red-600 font-bold">
																						{
																							penalty.points
																						}{" "}
																						pts
																					</span>
																					<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
																						<Pencil
																							className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
																							onClick={() => handlePenaltyEditing(selectedAwayTeamId, id)}
																						/>
																						<X
																							className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
																							onClick={() => handlePenaltyRemoval(selectedAwayTeamId, id)}
																						/>
																					</div>
																				</div>
																			</div>
																		)
																	)}
																</div>
															</AccordionContent>
														</AccordionItem>
													</Accordion>
												)}
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>
																Player Name
															</TableHead>
															<TableHead />
															{Array.from({
																length: 11,
															}).map((_, i) => (
																<TableHead
																	key={i}
																	className="text-center"
																>
																	Game {i + 1}
																</TableHead>
															))}
														</TableRow>
													</TableHeader>
													<TableBody>
														{awayTeamPlayerInformation?.map(
															(player) => (
																<TableRow
																	key={
																		player.ledaId
																	}
																>
																	{/* TODO Implement a mentions button next to the name */}
																	<TableCell className="w-fit flex items-center gap-2">
																		<span>
																			{
																				player.fullName
																			}
																		</span>
																	</TableCell>
																	<TableCell>
																		<Button
																			variant="outline"
																			className="text-xs px-2 py-1 rounded-md border-gray-300 hover:bg-gray-100"
																			onClick={() =>
																				handleMentionClick(
																					String(
																						player.ledaId
																					),
																					selectedAwayTeamId
																				)
																			}
																		>
																			<span>
																				Mentions
																			</span>
																		</Button>
																	</TableCell>
																	{Array.from(
																		{
																			length: 11,
																		}
																	).map(
																		(
																			_,
																			i
																		) => {
																			const gameKey = `Game ${
																				i +
																				1
																			}`;
																			return (
																				<TableCell
																					key={
																						i
																					}
																					className="text-center cursor-pointer"
																					onClick={() =>
																						handleGameToggle(
																							"away",
																							String(
																								player.ledaId
																							),
																							i
																						)
																					}
																				>
																					<div className="border border-dashed border-gray-400 w-8 h-8 mx-auto flex items-center justify-center">
																						{awayTeamGameData[
																							player
																								.ledaId
																						]?.[
																							gameKey
																						] && (
																							<X className="h-5 w-5" />
																						)}
																					</div>
																				</TableCell>
																			);
																		}
																	)}
																</TableRow>
															)
														)}
													</TableBody>
												</Table>
											</div>
										</>
									)}
								</FolderTab>

								{/* Add the Game Points Table */}
								<FolderTab title="Game Points">
									{isLoading ? (
										<FolderTabSkeleton />
									) : (
										<div className="overflow-x-auto">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead></TableHead>
														{Array.from({
															length: 11,
														}).map((_, i) => (
															<TableHead
																key={i}
																className="text-center"
															>
																<div className="flex flex-col items-center gap-1">
																	<span>
																		Game{" "}
																		{i + 1}
																	</span>
																	<div className="flex items-center space-x-2">
																		<Checkbox
																			id={`home-win-${i}`}
																			checked={
																				homeWins[
																					i
																				]
																			}
																			onCheckedChange={() =>
																				handleHomeWinToggle(
																					i
																				)
																			}
																		/>
																		<Label
																			htmlFor={`home-win-${i}`}
																			className="text-xs"
																		>
																			Home
																			Win
																		</Label>
																	</div>
																</div>
															</TableHead>
														))}
													</TableRow>
												</TableHeader>
												<TableBody>
													<TableRow>
														<TableCell className="font-medium">
															Home Points
														</TableCell>
														{Array.from({
															length: 11,
														}).map((_, i) => (
															<TableCell
																key={i}
																className="text-center"
															>
																<input
																	type="text"
																	inputMode="numeric"
																	pattern="[0-9]*"
																	value={
																		homePoints[
																			i
																		]
																	}
																	onChange={(
																		e
																	) =>
																		handleHomePointsChange(
																			i,
																			e
																				.target
																				.value
																		)
																	}
																	className="w-12 text-center border border-gray-300 rounded p-1"
																	placeholder="0"
																/>
															</TableCell>
														))}
													</TableRow>
													<TableRow>
														<TableCell className="font-medium">
															Away Points
														</TableCell>
														{Array.from({
															length: 11,
														}).map((_, i) => (
															<TableCell
																key={i}
																className="text-center"
															>
																<input
																	type="text"
																	inputMode="numeric"
																	pattern="[0-9]*"
																	value={
																		awayPoints[
																			i
																		]
																	}
																	onChange={(
																		e
																	) =>
																		handleAwayPointsChange(
																			i,
																			e
																				.target
																				.value
																		)
																	}
																	className="w-12 text-center border border-gray-300 rounded p-1"
																	placeholder="0"
																/>
															</TableCell>
														))}
													</TableRow>
													<TableRow className="bg-gray-50">
														<TableCell className="font-bold">
															Total
														</TableCell>
														<TableCell
															colSpan={5}
															className="text-center font-bold"
														>
															Home:{" "}
															{
																calculatePoints()
																	.rawHomePoints
															}
															{calculatePoints()
																.homePenaltyPoints >
																0 && (
																<span className="text-red-600 ml-2">
																	(-
																	{
																		calculatePoints()
																			.homePenaltyPoints
																	}{" "}
																	penalties)
																</span>
															)}
															<div className="text-sm font-normal mt-1">
																Final:{" "}
																{
																	calculatePoints()
																		.finalHomePoints
																}
															</div>
														</TableCell>
														<TableCell
															colSpan={6}
															className="text-center font-bold"
														>
															Away:{" "}
															{
																calculatePoints()
																	.rawAwayPoints
															}
															{calculatePoints()
																.awayPenaltyPoints >
																0 && (
																<span className="text-red-600 ml-2">
																	(-
																	{
																		calculatePoints()
																			.awayPenaltyPoints
																	}{" "}
																	penalties)
																</span>
															)}
															<div className="text-sm font-normal mt-1">
																Final:{" "}
																{
																	calculatePoints()
																		.finalAwayPoints
																}
															</div>
														</TableCell>
													</TableRow>
												</TableBody>
											</Table>
										</div>
									)}
								</FolderTab>

								{/* Action Buttons: Save, Save & Complete, Reset Changes, Delete */}
								<div className="flex flex-wrap gap-3 justify-center mt-6">
									<Button
										onClick={() => saveMatchup(false)}
										className={"bg-blue-600 hover:bg-blue-700 text-white " + (isDataChanged ? "animate-pulse" : "")}
										disabled={isSaving || !isDataChanged}
									>
										{isSaving ? "Saving..." : "Save"}
									</Button>
									<Button
										onClick={() => saveMatchup(true)}
										className="bg-green-600 hover:bg-green-700 text-white"
										disabled={isSaving || !isDataChanged}
									>
										Save & Mark Complete
									</Button>
									<Button
										onClick={() => {
											if (!originalMatchupSnapshot) { window.alert("No snapshot to reset to yet."); return; }
											setHomeTeamGameData(originalMatchupSnapshot.Home.teamGameData);
											setAwayTeamGameData(originalMatchupSnapshot.Away.teamGameData);
											setHomeWins([...originalMatchupSnapshot.Home.wins]);
											setHomePoints([...originalMatchupSnapshot.Home.points]);
											setAwayPoints([...originalMatchupSnapshot.Away.points]);
											setIsDataChanged(false);
										}}
										className="bg-yellow-500 hover:bg-yellow-600 text-white"
										disabled={isSaving || !originalMatchupSnapshot}
									>
										Reset Changes
									</Button>
									<Button
										onClick={() => {
											if (window.confirm("Delete all data for this matchup?")) {
												// Normalized delete: remove gameInfo row + player info rows for both teams
												(async () => {
													try {
														await deleteGameInfoMutation.mutateAsync({
															seasonCode,
															weekNum: selectedWeek,
															division: selectedDivision,
															subdivision: selectedSubdivision,
															homeTeamId: selectedHomeTeamId,
															awayTeamId: selectedAwayTeamId,
														});
														await deletePlayerInfoMutation.mutateAsync({ seasonCode, weekNum: selectedWeek, teamId: selectedHomeTeamId });
														await deletePlayerInfoMutation.mutateAsync({ seasonCode, weekNum: selectedWeek, teamId: selectedAwayTeamId });
													} catch (e) {
														console.error("Failed deleting matchup rows", e);
													}
												})();
												// Reset local UI state
												setHomeTeamGameData({});
												setAwayTeamGameData({});
												setHomeWins(Array(11).fill(false));
												setHomePoints(Array(11).fill(""));
												setAwayPoints(Array(11).fill(""));
												setHomePenaltyTotal(0);
												setAwayPenaltyTotal(0);
												setIsMatchupCompleted(false);
												setIsDataChanged(false);
											}
										}}
										className="bg-red-600 hover:bg-red-700 text-white"
										disabled={isSaving}
									>
										Delete Scoresheet
									</Button>
									<Button
										onClick={async () => {
											if (window.confirm("Mark this week as a bye week? No points will be awarded, but the scoresheet will be marked as completed.")) {
												try {
													// Save game info with all zeros and mark as completed
													const emptyGameInfo: Record<string, { homeWin: boolean; homePoints: string; awayPoints: string }> = {};
													for (let i = 0; i < 11; i++) {
														const gameKey = `Game ${i + 1}`;
														emptyGameInfo[gameKey] = {
															homeWin: false,
															homePoints: "0",
															awayPoints: "0",
														};
													}

													await saveGameInfoMutation.mutateAsync({
														seasonCode,
														weekNum: parseInt(selectedWeek),
														division: selectedDivision,
														subdivision: selectedSubdivision,
														homeTeamId: selectedHomeTeamId,
														awayTeamId: selectedAwayTeamId,
														homePoints: 0,
														awayPoints: 0,
														completed: true,
														gameInfo: emptyGameInfo,
													});

													// Also save zero points to legacy team points tables
													await saveWeeklyTeamPointsMutation.mutateAsync({
														seasonCode,
														weekNum: parseInt(selectedWeek),
														ledaId: selectedHomeTeamId,
														totalPoints: 0,
													});
													await saveWeeklyTeamPointsMutation.mutateAsync({
														seasonCode,
														weekNum: parseInt(selectedWeek),
														ledaId: selectedAwayTeamId,
														totalPoints: 0,
													});

													// Update local UI state to reflect bye week
													setHomeWins(Array(11).fill(false));
													setHomePoints(Array(11).fill("0"));
													setAwayPoints(Array(11).fill("0"));
													setIsMatchupCompleted(true);
													setIsDataChanged(false);

													const newSnap = {
														Home: { teamGameData: JSON.parse(JSON.stringify(homeTeamGameData)), wins: Array(11).fill(false), points: Array(11).fill("0"), penalties: JSON.parse(JSON.stringify(homePenalties)) },
														Away: { teamGameData: JSON.parse(JSON.stringify(awayTeamGameData)), points: Array(11).fill("0"), penalties: JSON.parse(JSON.stringify(awayPenalties)) },
														completed: true,
													};
													setLastSavedSnapshot(newSnap);
													if (!originalMatchupSnapshot) setOriginalMatchupSnapshot(newSnap);
												} catch (e) {
													console.error("Failed to mark bye week", e);
													alert("Failed to mark bye week. Please try again.");
												}
											}
										}}
										className="bg-blue-600 hover:bg-blue-700 text-white"
										disabled={isSaving}
									>
										Bye Week
									</Button>
								</div>
								{isMatchupCompleted && (
									<div className="mt-2 text-center text-green-700 font-semibold">Matchup marked complete.</div>
								)}
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Add Mention Dialog */}
			<Dialog
				open={mentionDialogOpen}
				onOpenChange={(open) => {
					setMentionDialogOpen(open);
					if (!open) {
						// Reset form state when closing
						setSelectedMentionData(null);
						setMentionPoints(0);
						setMentionCount(0);
						setMentionNotes("");
						setMentionEditMode(false);
						setCurrentEditingMention(null);
					}
				}}
			>
				<DialogContent className="sm:max-w-[500px] bg-white overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{mentionEditMode ? "Edit" : "Add"} Mention for
							Player: {selectedPlayerForMention?.name}
						</DialogTitle>
						<DialogDescription>
							On Team: {selectedPlayerForMention?.teamName}
						</DialogDescription>
					</DialogHeader>
					{/* Mention form with MentionSelector */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-2">
								Select Mention *
							</label>
							{/* Create a simple wrapper for MentionSelector */}
							<MentionSelectorWrapper 
								onMentionChange={(value) => {
									console.log("MentionSelector change:", value);
									setSelectedMentionData(value);
									// Auto-populate points from selector
									const pointsValue = parseInt(value.points);
									if (!isNaN(pointsValue)) {
										setMentionPoints(pointsValue);
									}
								}}
								initialValue={selectedMentionData}
							/>
							
							{/* Display selected mention info */}
							{selectedMentionData && (
								<div className="mt-2 p-3 bg-gray-50 border rounded">
									<div className="text-sm">
										<div><strong>Code:</strong> {selectedMentionData.mentionCode}</div>
										<div><strong>Description:</strong> {selectedMentionData.desc}</div>
										<div><strong>Default Points:</strong> {selectedMentionData.points}</div>
									</div>
								</div>
							)}
						</div>
						
						<div className="flex gap-4">
							<div className="flex-1">
								<label className="block text-sm font-medium mb-2">
									Points *
								</label>
								<input
									type="number"
									value={mentionPoints}
									onChange={(e) => setMentionPoints(parseInt(e.target.value) || 0)}
									className="w-full p-2 border rounded"
									placeholder="Points"
								/>
							</div>
							<div className="flex-1">
								<label className="block text-sm font-medium mb-2">
									Count/Darts
								</label>
								<input
									type="number"
									value={mentionCount}
									onChange={(e) => setMentionCount(parseInt(e.target.value) || 0)}
									className="w-full p-2 border rounded"
									placeholder="Count"
								/>
							</div>
						</div>
						
						<div>
							<label className="block text-sm font-medium mb-2">
								Notes
							</label>
							<textarea
								value={mentionNotes}
								onChange={(e) => setMentionNotes(e.target.value)}
								className="w-full p-2 border rounded"
								rows={3}
								placeholder="Additional notes"
							/>
						</div>
						
						<div className="flex justify-center gap-2">
							<Button
								type="button"
								onClick={() => {
									console.log("Add/Update button clicked!");
									
									const mentionCode = selectedMentionData?.mentionCode || "";
									const mentionDesc = selectedMentionData?.desc || "";
									
									console.log("Form values:", {
										mentionCode,
										mentionDesc,
										mentionPoints,
										mentionCount,
										mentionNotes
									});
									
									if (!mentionCode || !mentionDesc) {
										alert("Please fill in Mention Code and Description");
										return;
									}
									
									if (mentionEditMode && currentEditingMention) {
										updateMention(
											currentEditingMention.id,
											mentionCode,
											mentionDesc,
											mentionPoints,
											mentionCount,
											mentionNotes
										);
									} else {
										handleMentionSubmit(
											mentionCode,
											mentionDesc,
											mentionPoints,
											mentionCount,
											mentionNotes
										);
									}
									
									// Reset form state
									setSelectedMentionData(null);
									setMentionPoints(0);
									setMentionCount(0);
									setMentionNotes("");
									
									// Close dialog
									setMentionDialogOpen(false);
									setMentionEditMode(false);
									setCurrentEditingMention(null);
								}}
								className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
							>
								{mentionEditMode ? "Update Mention" : "Add Mention"}
							</Button>
							<Button
								type="button"
								onClick={() => {
									setMentionDialogOpen(false);
									setMentionEditMode(false);
									setCurrentEditingMention(null);
								}}
								className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
							>
								Cancel
							</Button>
						</div>
					</div>

					{/* Render existing mentions */}
					{selectedPlayerForMention && (
						<>
							<div className="space-y-2">
								<h3 className="font-semibold">
									Existing Mentions
								</h3>
								{currentPlayerMentions && currentPlayerMentions.length > 0 ? (
									<div className="space-y-2 max-h-60 overflow-y-auto">
										{currentPlayerMentions.map((mention) => (
											<div
												key={mention.mentionId}
												className="p-3 border rounded-md bg-gray-50 shadow-sm group relative"
											>
												<div className="flex justify-between items-start">
													<span className="font-semibold text-blue-600">
														{mention.mentionCode}
													</span>
													<div className="flex items-center">
														<span className="text-green-600 font-bold">
															{mention.mentionPoints} pts
														</span>
														<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
															<Pencil
																className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
																onClick={() =>
																	handleMentionEditing(
																		selectedPlayerForMention.id,
																		selectedPlayerForMention.teamId,
																		mention.mentionId
																	)
																}
															/>
															<X
																className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
																onClick={() =>
																	handleMentionDelete(
																		selectedPlayerForMention.id,
																		selectedPlayerForMention.teamId,
																		mention.mentionId
																	)
																}
															/>
														</div>
													</div>
												</div>
												<p className="text-sm mt-1">
													{mention.mentionDesc}
												</p>
												{mention.notes && (
													<p className="text-sm text-gray-600 mt-1 italic">
														Notes: {mention.notes}
													</p>
												)}
											</div>
										))}
									</div>
								) : (
									<p className="text-gray-500 text-sm italic">
										No mentions have been added yet
									</p>
								)}
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}