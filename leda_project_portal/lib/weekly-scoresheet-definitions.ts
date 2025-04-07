/**
 * Weekly Scoresheet Type Definitions
 *
 * This file defines the TypeScript interfaces used throughout the weekly scoresheet feature:
 * - Data structures for divisions, teams, games, and players
 * - Score and point tracking structures
 * - Penalty tracking structures
 *
 * These definitions ensure type safety across the various components that handle
 * scoresheet data, from UI display to API interactions.
 */

/**
 * Represents a single game match between two teams
 */
export interface Game {
	homeTeamLetter: string; // Letter identifier for home team
	homeTeamId: string; // Unique ID for home team
	awayTeamLetter: string; // Letter identifier for away team
	awayTeamId: string; // Unique ID for away team
}

/**
 * Collection of games within a subdivision, indexed by game number
 */
export interface Subdivision {
	[gameNumber: string]: Game;
}

/**
 * Collection of subdivisions within a division
 */
export interface Division {
	[subdivisionName: string]: Subdivision;
}

/**
 * Top-level structure organizing all divisions
 */
export interface DivisionData {
	[divisionName: string]: Division;
}

/**
 * Tracks player participation across multiple games
 */
export interface PlayerGameData {
	[gameKey: string]: boolean; // e.g., "Game 1": false, "Game 2": true, etc.
}

/**
 * Maps player IDs to their game participation data
 */
export interface TeamGameData {
	[playerId: string]: PlayerGameData;
}

/**
 * Represents player point calculations
 */
export interface PlayerPoints {
	playerId: string;
	playerName: string;
	totalPoints: number;
	pointsByGame: Record<string, number>;
}

/**
 * Represents a player mention (special notation or achievement)
 */
export interface PlayerMention {
	mentionCode: string;
	desc: string;
	points: number;
	notes?: string;
}

/**
 * Comprehensive structure for all scoresheet data
 * Hierarchically organized by division, subdivision, and matchup
 */
export interface FormattedScoreData {
	[division: string]: {
		[subdivision: string]: {
			[matchup: string]: {
				// Team information including players and penalties
				teamInformation: {
					[teamId: string]: {
						teamLetter: string;
						teamName: string;
						home: boolean;
						// Player data within team
						teamMembers: {
							[playerId: string]: {
								name: string;
								gameStats: Record<string, boolean>;
								mentions?: {
									[mentionId: string]: PlayerMention;
								};
								gamePoints: string;
							};
						};
						// Penalty data for team
						penalties: {
							[penaltyId: string]: {
								penaltyCode: string;
								points: number;
								notes?: string;
							};
						};
					};
				};
				// Individual game results
				gameInformation: {
					[game: string]: {
						homeWin: boolean;
						homePoints: string;
						awayPoints: string;
					};
				};
				// Overall team points
				teamPoints: {
					homePoints: string;
					awayPoints: string;
				};
			};
		};
	};
}

/**
 * Match data for a team (used for scheduling)
 */
export interface TeamMatchData {
	matchDate: string;
	matchTime: string;
	home: boolean;
	opposingTeamId: string;
	opposingTeamLetter: string;
}

/**
 * Team information including schedule data
 */
export interface Team {
	teamName: string;
	teamId: string;
	matchesData: {
		[dateKey: string]: TeamMatchData;
	};
}
