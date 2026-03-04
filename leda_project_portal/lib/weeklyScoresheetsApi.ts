/**
 * Weekly Scoresheets API helpers
 *
 * All standalone fetch/mutate functions for the V2 weekly scoresheets feature.
 * Extracted from weekly-scoreesheets-content.tsx to keep the component lean.
 */

import { fetchWithSession } from "@/lib/getData";
import {
	teamRoute,
	playerRoute,
	playerBatchRoute,
	mentionPlayerHistoryRoute,
	rosterTeamViewRoute,
	memberInfoRoute,
} from "@/lib/apiRoutes";
import { Player } from "@/lib/definitions";

// ---------------------------------------------------------------------------
// Route constants (exported so the component can use them directly in queries)
// ---------------------------------------------------------------------------

export const weeklyScoresheetsV2PlayersRoute =
	"/api/activities/scoresheets/weeklyScoresheetsV2/players";
export const weeklyScoresheetsV2GameInfoRoute =
	"/api/activities/scoresheets/weeklyScoresheetsV2/gameInfo";
export const weeklyScoresheetsV2TeamInfoRoute =
	"/api/activities/scoresheets/weeklyScoresheetsV2/teamInfo";
export const weeklyScoresheetsV2RecalculateRoute =
	"/api/activities/scoresheets/weeklyScoresheetsV2/recalculateAfterDelete";

/** Legacy aggregate points endpoints (must remain for leaderboards/history) */
export const weeklyPlayerPointsRoute =
	"/api/activities/scoresheets/playerPoints";
export const weeklyTeamPointsRoute = "/api/activities/scoresheets/teamPoints";

// ---------------------------------------------------------------------------
// Generic entity fetchers
// ---------------------------------------------------------------------------

export const fetchTeam = async (teamId: string) => {
	const url = `${teamRoute}?ledaId=${encodeURIComponent(teamId)}`;
	const response = await fetchWithSession(url, { method: "GET" });
	if (response.status === 204 || response.status === 404) return null;
	if (!response.ok) return null;
	return response.json();
};

export const fetchPlayer = async (playerId: string | number) => {
	const url = `${playerRoute}?ledaId=${encodeURIComponent(String(playerId))}`;
	const response = await fetchWithSession(url, { method: "GET" });
	if (response.status === 204 || response.status === 404) return null;
	if (!response.ok) return null;
	return response.json();
};

export const fetchPlayersBatch = async (
	playerIds: Array<string | number>
): Promise<Record<string, Player | null>> => {
	const normalized = playerIds.map((id) => String(id)).filter(Boolean);
	const response = await fetchWithSession(playerBatchRoute, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ playerIds: normalized }),
	});
	if (!response.ok) return {};
	return response.json();
};

export const fetchRosterTeamId = async ({
	seasonCode,
	division,
	subdivision,
	teamLetter,
}: {
	seasonCode: string;
	division: string;
	subdivision: string;
	teamLetter: string;
}): Promise<string | null> => {
	const url = `${rosterTeamViewRoute}?seasonCode=${encodeURIComponent(seasonCode)}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(subdivision)}&teamLetter=${encodeURIComponent(teamLetter)}`;
	const res = await fetchWithSession(url, { method: "GET" });
	if (res.status === 204 || res.status === 404) return null;
	if (!res.ok) return null;
	const data = await res.json();
	return data[0]?.teamId || data[0]?.ledaid || data[0]?.ledaId || null;
};

export const fetchTeamMembers = async (
	teamId: string
): Promise<Array<{ ledaId: string }>> => {
	const url = `${memberInfoRoute}?ledaId=${encodeURIComponent(teamId)}`;
	const res = await fetchWithSession(url, { method: "GET" });
	if (res.status === 204 || res.status === 404) return [];
	if (!res.ok) return [];
	return res.json();
};

// ---------------------------------------------------------------------------
// V2 scoresheet fetchers
// ---------------------------------------------------------------------------

export const fetchTeamInfoV2 = async ({
	seasonCode,
	weekNum,
	division,
	subdivision,
	teamLetter,
}: {
	seasonCode: string;
	weekNum: string;
	division: string;
	subdivision: string;
	teamLetter: string;
}) => {
	const url = `${weeklyScoresheetsV2TeamInfoRoute}?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(subdivision)}&teamLetter=${encodeURIComponent(teamLetter)}`;
	const res = await fetchWithSession(url, { method: "GET" });
	if (res.status === 204 || res.status === 404) return null;
	if (!res.ok) return null;
	return res.json();
};

export const fetchGameInfoV2 = async ({
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
	const url = `${weeklyScoresheetsV2GameInfoRoute}?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(weekNum)}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(subdivision)}&homeTeamId=${encodeURIComponent(homeTeamId)}&awayTeamId=${encodeURIComponent(awayTeamId)}`;
	const res = await fetchWithSession(url, { method: "GET" });
	if (res.status === 204 || res.status === 404) return null;
	if (!res.ok) return null;
	return res.json();
};

// ---------------------------------------------------------------------------
// V2 mutation helpers
// ---------------------------------------------------------------------------

export const savePlayerPoints = async ({
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
	const response = await fetchWithSession(weeklyScoresheetsV2PlayersRoute, {
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
	});
	return response.json();
};

export const saveGameInfo = async ({
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
	gameInfo: Record<
		string,
		{ homeWin: boolean; homePoints: string; awayPoints: string }
	>;
}) => {
	const response = await fetchWithSession(weeklyScoresheetsV2GameInfoRoute, {
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
	});
	return response.json();
};

/** Legacy cumulative team points upsert (stores rolling totals for leaderboards) */
export const saveWeeklyTeamPoints = async ({
	seasonCode,
	weekNum,
	division,
	subdivision,
	ledaId,
	totalPoints,
}: {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: string;
	ledaId: string;
	totalPoints: number;
}) => {
	const res = await fetchWithSession(weeklyTeamPointsRoute, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			seasonCode,
			weekNum,
			division,
			subdivision,
			ledaId,
			totalPoints,
		}),
	});
	return res.json();
};

/** Legacy cumulative player points upsert */
export const saveWeeklyPlayerPoints = async ({
	seasonCode,
	weekNum,
	division,
	subdivision,
	ledaId,
	teamLedaId,
	totalPoints,
}: {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: string;
	ledaId: string;
	teamLedaId: string;
	totalPoints: number;
}) => {
	const res = await fetchWithSession(weeklyPlayerPointsRoute, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			seasonCode,
			weekNum,
			division,
			subdivision,
			ledaId,
			teamLedaId,
			totalPoints,
		}),
	});
	return res.json();
};

export const saveTeamInfo = async ({
	seasonCode,
	weekNum,
	division,
	subdivision,
	home,
	teamId,
	teamName,
	teamLetter,
	teamLabel,
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
	teamLabel: string;
	opposingTeamId: string;
	penalties: Record<
		string,
		{ penaltyCode: string; points: number; notes?: string }
	>;
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
			teamLabel,
			opposingTeamId,
			penalties,
		}),
	});
	return response.json();
};

// ---------------------------------------------------------------------------
// Delete helpers
// ---------------------------------------------------------------------------

export const deleteGameInfo = async ({
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

export const deletePlayerInfoForTeam = async ({
	seasonCode,
	weekNum,
	teamId,
}: {
	seasonCode: string;
	weekNum: string | number;
	teamId: string;
}) => {
	const url = `${weeklyScoresheetsV2PlayersRoute}?seasonCode=${encodeURIComponent(String(seasonCode))}&weekNum=${encodeURIComponent(String(weekNum))}&teamId=${encodeURIComponent(teamId)}`;
	const res = await fetchWithSession(url, { method: "DELETE" });
	return res.json();
};

export const deleteTeamInfo = async ({
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
	const url = `${weeklyScoresheetsV2TeamInfoRoute}?seasonCode=${encodeURIComponent(String(seasonCode))}&weekNum=${encodeURIComponent(String(weekNum))}&division=${encodeURIComponent(division)}&subdivision=${encodeURIComponent(String(subdivision))}&homeTeamId=${encodeURIComponent(homeTeamId)}&awayTeamId=${encodeURIComponent(awayTeamId)}`;
	const res = await fetchWithSession(url, { method: "DELETE" });
	return res.json();
};

// ---------------------------------------------------------------------------
// Mention history helpers
// ---------------------------------------------------------------------------

export type MentionHistoryPayload = {
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
};

export const createMentionHistory = async (data: MentionHistoryPayload) => {
	const response = await fetchWithSession(mentionPlayerHistoryRoute, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...data, count: data.count ?? 0 }),
	});
	return response.json();
};

export const updateMentionHistory = async (data: MentionHistoryPayload) => {
	const response = await fetchWithSession(mentionPlayerHistoryRoute, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...data, count: data.count ?? 0 }),
	});
	return response.json();
};

export const deleteMentionHistory = async (
	data: Omit<MentionHistoryPayload, "count">
) => {
	const response = await fetchWithSession(mentionPlayerHistoryRoute, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	return response.json();
};

export const recalculateAfterDelete = async ({
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
	subdivision: string;
	homeTeamId: string;
	awayTeamId: string;
}) => {
	const response = await fetchWithSession(weeklyScoresheetsV2RecalculateRoute, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ seasonCode, weekNum, division, subdivision, homeTeamId, awayTeamId }),
	});
	return response.json();
};

export const deleteMentionsByMatchup = async ({
	seasonCode,
	weekNum,
	homeTeamId,
	awayTeamId,
}: {
	seasonCode: string;
	weekNum: string | number;
	homeTeamId: string;
	awayTeamId: string;
}) => {
	const url = `${mentionPlayerHistoryRoute}?seasonCode=${encodeURIComponent(seasonCode)}&weekNum=${encodeURIComponent(String(weekNum))}&homeTeamId=${encodeURIComponent(homeTeamId)}&awayTeamId=${encodeURIComponent(awayTeamId)}`;
	const response = await fetchWithSession(url, { method: "DELETE" });
	return response.json();
};
