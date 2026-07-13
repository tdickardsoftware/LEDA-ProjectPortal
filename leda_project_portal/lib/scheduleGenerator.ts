/**
 * Round-robin schedule generator for the LEDA scheduling system.
 *
 * Uses the standard circle/polygon method to generate fair round-robin pairings.
 * Every team in a subdivision plays every other team exactly once.
 * Odd-numbered team counts receive one BYE week automatically.
 *
 * IMPORTANT: Matchups are ALWAYS scoped to their own subdivision.
 * Teams from different subdivisions are NEVER paired together.
 */

import type { TeamData, ScheduleData, DivisionsData } from "./schedule";

// ─── Public types ────────────────────────────────────────────────────────────

export type GenerateScope =
	| { type: "subdivision"; division: string; subdivision: string }
	| { type: "division"; division: string }
	| { type: "all" };

export interface GeneratorOptions {
	/** Default match time in 24-hour format, e.g. "19:30" */
	defaultMatchTime: string;
	/**
	 * When true, weeks where either team already has a matchup are left untouched.
	 * When false (default), all existing matchups in scope are replaced.
	 */
	skipFilledWeeks: boolean;
	/**
	 * Optional round offset applied after pairings are built.
	 * Useful for generating a different valid schedule without changing opponents.
	 */
	rotationOffset?: number;
	/**
	 * Optional seed used to shuffle the initial team order before pairings are built.
	 * The same seed produces the same schedule preview and generated data.
	 */
	shuffleSeed?: number;
	/**
	 * When true, uses the legacy LEDA recursive half-split pairing pattern with
	 * pre-determined home/away assignments derived from historical data.
	 * Supported for subdivisions with 2, 4, 6, or 8 effective team slots.
	 * Falls back to the standard circle method for other team counts.
	 */
	sequentialPairing?: boolean;
}

export interface GenerationPreview {
	division: string;
	subdivision: string;
	teamCount: number;
	/** Total rounds the algorithm needs to cover every pairing once. */
	roundsPerCycle: number;
	/** How many game-date weeks are available to fill. */
	weeksAvailable: number;
	/** How many weeks already contain saved matchups and will be preserved. */
	preservedWeeks: number;
	/** Set when roundsNeeded > weeksAvailable. */
	warning?: string;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

const BYE_PLACEHOLDER = "__BYE__";

function normalizeRotationOffset(offset: number | undefined, length: number): number {
	if (length <= 0) return 0;
	const normalized = offset ?? 0;
	return ((normalized % length) + length) % length;
}

function rotateRounds(
	rounds: [string, string][][],
	offset: number | undefined
): [string, string][][] {
	if (rounds.length <= 1) return rounds;
	const normalizedOffset = normalizeRotationOffset(offset, rounds.length);
	if (normalizedOffset === 0) return rounds;
	return [...rounds.slice(normalizedOffset), ...rounds.slice(0, normalizedOffset)];
}

function createSeededRandom(seed: number) {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}

function shuffleTeamLetters(teamLetters: string[], seed: number | undefined): string[] {
	if (seed === undefined) return [...teamLetters];
	const random = createSeededRandom(seed);
	const shuffled = [...teamLetters];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * LEDA legacy pairing algorithm (recursive half-split).
 *
 * Returns rounds as [home, away] pairs — the first element is ALWAYS the home
 * team for cycle 1 (the caller flips for cycle 2 via shouldFlipCycleHomeAway).
 *
 * Exact schedules for n=2, 4, 6, 8 are derived from historical LEDA database data.
 * Odd team counts are padded with a BYE slot at the end before applying the
 * even-team algorithm (e.g. 7 real teams → 8-team schedule with 1 BYE).
 * Falls back to the standard circle method for other (larger) sizes.
 */
function buildPairingsLEDA(teamLetters: string[]): [string, string][][] {
	const isOdd = teamLetters.length % 2 !== 0;
	const teams = isOdd ? [...teamLetters, BYE_PLACEHOLDER] : [...teamLetters];
	const n = teams.length;
	const t = (i: number) => teams[i];

	if (n === 2) {
		// Single round; team 0 is home.
		return [[[t(0), t(1)]]];
	}

	if (n === 4) {
		// 3-round schedule derived from the n=8 recursive structure (L sub-group).
		// W0: base pairs — 0H, 3H
		// W1: sub-cross j=0 — 2H, 1H
		// W2: sub-cross j=1 — all lower home
		return [
			[[t(0), t(1)], [t(3), t(2)]],
			[[t(2), t(0)], [t(1), t(3)]],
			[[t(0), t(3)], [t(1), t(2)]],
		];
	}

	if (n === 6) {
		// 5-round schedule derived from historical LEDA data (s01/Summer/sub4).
		// Pairs ordered [home, away] for cycle 1.
		return [
			[[t(0), t(1)], [t(2), t(5)], [t(3), t(4)]],
			[[t(2), t(0)], [t(4), t(1)], [t(5), t(3)]],
			[[t(0), t(5)], [t(1), t(3)], [t(4), t(2)]],
			[[t(3), t(0)], [t(1), t(2)], [t(5), t(4)]],
			[[t(0), t(4)], [t(5), t(1)], [t(2), t(3)]],
		];
	}

	if (n === 8) {
		// 7-round schedule from the recursive half-split algorithm.
		// L={0..3}, U={4..7}. Weeks 0-2 within-group; weeks 3-6 cross-group.
		// Pairs ordered [home, away] for cycle 1 — verified against LEDA CSV data.
		const half = 4;
		const rounds: [string, string][][] = [
			// W0: base pairs, homeFirst = [T, F, F, T] (0H, 3H, 5H, 6H)
			[[t(0), t(1)], [t(3), t(2)], [t(5), t(4)], [t(6), t(7)]],
			// W1: sub-cross j=0, homeFirst = [F, T, T, F] (2H, 1H, 4H, 7H)
			[[t(2), t(0)], [t(1), t(3)], [t(4), t(6)], [t(7), t(5)]],
			// W2: sub-cross j=1, all lower home (0H, 1H, 4H, 5H)
			[[t(0), t(3)], [t(1), t(2)], [t(4), t(7)], [t(5), t(6)]],
		];
		// W3-W6: cross-group rounds.
		// j even → upper group home; j odd → lower group home.
		for (let j = 0; j < half; j++) {
			const round: [string, string][] = [];
			const lowerHome = j % 2 === 1;
			for (let i = 0; i < half; i++) {
				const lTeam = i;
				const uTeam = (i + j) % half + half;
				round.push(lowerHome ? [t(lTeam), t(uTeam)] : [t(uTeam), t(lTeam)]);
			}
			rounds.push(round);
		}
		return rounds;
	}

	// Fallback for larger subdivisions: use standard circle method.
	// Note: home/away is NOT pre-determined in this path; the caller must
	// use homeCount-based assignment for these cases.
	return buildPairings(teams);
}

/**
 * Core circle-method round-robin pairing generator.
 *
 * Returns an array of rounds; each round is an array of [teamA, teamB] pairs.
 * teamB === '__BYE__' means teamA has a BYE for that round.
 *
 * For N teams (N even): generates N-1 rounds, each with N/2 pairs.
 * For N teams (N odd): adds a phantom BYE slot → N rounds, each with
 *   (N-1)/2 real pairs + 1 BYE pair.
 */
function buildPairings(teamLetters: string[]): [string, string][][] {
	const isOdd = teamLetters.length % 2 !== 0;
	const list = isOdd ? [...teamLetters, BYE_PLACEHOLDER] : [...teamLetters];
	const m = list.length; // always even after padding

	const result: [string, string][][] = [];

	for (let r = 0; r < m - 1; r++) {
		const pairs: [string, string][] = [];

		// Rotating segment: shift the non-fixed positions left by r.
		const rotating = [...list.slice(1 + r), ...list.slice(1, 1 + r)];

		// Fixed team (list[0]) plays the last slot of the rotating segment.
		pairs.push([list[0], rotating[m - 2]]);

		// Pair remaining rotating slots as mirror images.
		for (let i = 0; i < Math.floor((m - 2) / 2); i++) {
			pairs.push([rotating[i], rotating[m - 3 - i]]);
		}

		result.push(pairs);
	}

	return result;
}

/**
 * Generates a complete TeamMatchData map for one subdivision.
 * Always confined to the teams supplied — never crosses subdivision boundaries.
 */
function generateForSubdivision(
	division: string,
	subdivision: string,
	teams: Record<string, TeamData>,
	gameDateEntries: [string, string][],
	existingSubdivData: ScheduleData[string][string] | undefined,
	options: GeneratorOptions
): ScheduleData[string][string] {
	const subdivisionId = `${division}-${subdivision}`;

	// Filter out phantom placeholder teams (teamId === "0")
	const teamLetters = Object.keys(teams).filter((l) => teams[l].teamId !== "0");

	// Build result skeleton; carry over existing matchesData when skipping filled weeks
	const result: ScheduleData[string][string] = {};
	for (const [letter, teamData] of Object.entries(teams)) {
		result[letter] = {
			teamName: teamData.teamName,
			teamId: teamData.teamId,
			matchesData:
				options.skipFilledWeeks && existingSubdivData?.[letter]
					? { ...existingSubdivData[letter].matchesData }
					: {},
		};
	}

	if (teamLetters.length < 2) return result; // Need at least 2 teams to schedule

	const shuffledTeamLetters = shuffleTeamLetters(teamLetters, options.shuffleSeed);

	// Determine whether to use the LEDA recursive algorithm.
	// Only activate for effective sizes 2, 4, 6, 8 (odd counts get +1 BYE → even).
	const effectiveN = teamLetters.length % 2 === 0 ? teamLetters.length : teamLetters.length + 1;
	const useLEDA = !!options.sequentialPairing && effectiveN >= 2 && effectiveN <= 8;

	const rounds = rotateRounds(
		useLEDA ? buildPairingsLEDA(shuffledTeamLetters) : buildPairings(shuffledTeamLetters),
		options.rotationOffset
	);
	const preservedWeekKeys = new Set<string>();
	if (options.skipFilledWeeks) {
		for (const teamData of Object.values(result)) {
			for (const weekKey of Object.keys(teamData.matchesData)) {
				preservedWeekKeys.add(weekKey);
			}
		}
	}

	let roundCursor = options.skipFilledWeeks ? preservedWeekKeys.size : 0;

	// Track home-game counts per team for balanced home/away assignment
	const homeCount: Record<string, number> = {};
	for (const l of teamLetters) homeCount[l] = 0;

	for (const [weekKey, date] of gameDateEntries) {
		if (options.skipFilledWeeks && preservedWeekKeys.has(weekKey)) {
			continue;
		}

		const roundIndex = roundCursor % rounds.length;
		const cycleNumber = Math.floor(roundCursor / rounds.length);
		const activeRound = rounds[roundIndex];
		roundCursor++;

		for (const [rawTeamA, rawTeamB] of activeRound) {
			const shouldFlipCycleHomeAway = cycleNumber % 2 === 1;
			const teamA = shouldFlipCycleHomeAway ? rawTeamB : rawTeamA;
			const teamB = shouldFlipCycleHomeAway ? rawTeamA : rawTeamB;

			// The BYE placeholder can appear in either slot depending on the rotation round.
			const isBye = teamA === BYE_PLACEHOLDER || teamB === BYE_PLACEHOLDER;

			if (isBye) {
				// The real team is whichever slot is NOT the placeholder.
				const realTeam = teamA === BYE_PLACEHOLDER ? teamB : teamA;

				// Skip this BYE if the week is already scheduled and skipFilledWeeks is on
				if (options.skipFilledWeeks && result[realTeam]?.matchesData?.[weekKey]) continue;

				result[realTeam].matchesData[weekKey] = {
					matchDate: date,
					matchTime: options.defaultMatchTime,
					home: false,
					opposingTeamId: "0",
					opposingTeamLetter: "X",
					subdivisionId,
				};
			} else {
				// Skip if either team already has this week scheduled
				if (
					options.skipFilledWeeks &&
					(result[teamA]?.matchesData?.[weekKey] || result[teamB]?.matchesData?.[weekKey])
				) {
					continue;
				}

				// When using the LEDA algorithm the pair is already ordered [home, away]
				// (after the cycle-flip above, teamA is always the home side).
				// Otherwise fall back to homeCount-based balancing.
				const isAHome = useLEDA
					? true
					: homeCount[teamA] < homeCount[teamB] ||
					  (homeCount[teamA] === homeCount[teamB] && roundCursor % 2 === 1);

				if (!useLEDA) {
					if (isAHome) homeCount[teamA]++;
					else homeCount[teamB]++;
				}

				result[teamA].matchesData[weekKey] = {
					matchDate: date,
					matchTime: options.defaultMatchTime,
					home: isAHome,
					opposingTeamId: teams[teamB].teamId,
					opposingTeamLetter: teamB,
					subdivisionId,
				};

				result[teamB].matchesData[weekKey] = {
					matchDate: date,
					matchTime: options.defaultMatchTime,
					home: !isAHome,
					opposingTeamId: teams[teamA].teamId,
					opposingTeamLetter: teamA,
					subdivisionId,
				};
			}
		}
	}

	return result;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generates a round-robin schedule for the specified scope.
 *
 * @param scope          Which divisions/subdivisions to generate for.
 * @param divisionsData  Full roster structure (source of truth for teams).
 * @param gameDateEntries Sorted [weekKey, dateString][] pairs, e.g. [["week1","2025-09-05"], …]
 * @param existingData   Current schedule data (used when skipFilledWeeks is true).
 * @param options        Generator settings.
 *
 * @returns data     A ScheduleData object containing only the generated scope.
 *          preview  Per-subdivision summary for display in the dialog.
 */
export function generateSchedule(
	scope: GenerateScope,
	divisionsData: DivisionsData,
	gameDateEntries: [string, string][],
	existingData: ScheduleData,
	options: GeneratorOptions
): { data: ScheduleData; preview: GenerationPreview[] } {
	const generatedData: ScheduleData = {};
	const preview: GenerationPreview[] = [];

	const processSubdiv = (division: string, subdivision: string) => {
		const teams = divisionsData[division]?.subdivisions[subdivision];
		if (!teams) return;

		const teamLetters = Object.keys(teams).filter((l) => teams[l].teamId !== "0");
		const isOdd = teamLetters.length % 2 !== 0;
		const roundsPerCycle =
			teamLetters.length < 2 ? 0 : isOdd ? teamLetters.length : teamLetters.length - 1;

		const existing = existingData[division]?.[subdivision];
		const preservedWeekKeys = new Set<string>();
		if (options.skipFilledWeeks && existing) {
			for (const teamData of Object.values(existing)) {
				for (const weekKey of Object.keys(teamData.matchesData)) {
					preservedWeekKeys.add(weekKey);
				}
			}
		}
		const subdivResult = generateForSubdivision(
			division,
			subdivision,
			teams,
			gameDateEntries,
			existing,
			options
		);

		if (!generatedData[division]) generatedData[division] = {};
		generatedData[division][subdivision] = subdivResult;

		preview.push({
			division,
			subdivision,
			teamCount: teamLetters.length,
			roundsPerCycle,
			weeksAvailable: gameDateEntries.length,
			preservedWeeks: preservedWeekKeys.size,
			warning:
				roundsPerCycle > gameDateEntries.length
					? `Only ${gameDateEntries.length} of ${roundsPerCycle} unique rounds fit in available game weeks.`
					: gameDateEntries.length > roundsPerCycle
						? `Schedule repeats after ${roundsPerCycle} rounds to fill all ${gameDateEntries.length} weeks.`
						: undefined,
		});
	};

	if (scope.type === "subdivision") {
		processSubdiv(scope.division, scope.subdivision);
	} else if (scope.type === "division") {
		const div = divisionsData[scope.division];
		if (div) {
			for (const sub of Object.keys(div.subdivisions)) {
				processSubdiv(scope.division, sub);
			}
		}
	} else {
		// All divisions
		for (const division of Object.keys(divisionsData)) {
			const divData = divisionsData[division];
			if (!divData?.subdivisions) continue;
			for (const sub of Object.keys(divData.subdivisions)) {
				processSubdiv(division, sub);
			}
		}
	}

	return { data: generatedData, preview };
}
