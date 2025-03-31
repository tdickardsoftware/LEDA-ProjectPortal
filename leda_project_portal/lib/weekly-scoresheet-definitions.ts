export interface Game {
	homeTeamLetter: string;
	homeTeamId: string;
	awayTeamLetter: string;
	awayTeamId: string;
}

export interface Subdivision {
	[gameNumber: string]: Game;
}

export interface Division {
	[subdivisionName: string]: Subdivision;
}

export interface DivisionData {
	[divisionName: string]: Division;
}

export interface PlayerGameData {
	[gameKey: string]: boolean; // e.g., "Game 1": false, "Game 2": true, etc.
}

export interface TeamGameData {
	[playerId: string]: PlayerGameData;
}

export interface PlayerPoints {
	playerId: string;
	playerName: string;
	totalPoints: number;
	pointsByGame: Record<string, number>;
}

export interface FormattedScoreData {
	[division: string]: {
		[subdivision: string]: {
			[matchup: string]: {
				teamInformation: {
					[teamId: string]: {
						teamLetter: string;
						teamName: string;
						home: boolean;
						teamMembers: {
							[playerId: string]: {
								name: string;
								gameStats: Record<string, boolean>;
								gamePoints: string;
							};
						};
                        penalties: {
                            [penaltyCode: string]: {
                                points: number;
                                notes?: string;
                            }
                        }
					};
				};
				gameInformation: {
					[game: string]: {
						homeWin: boolean;
						homePoints: string;
						awayPoints: string;
					};
				};
				teamPoints: {
					homePoints: string;
					awayPoints: string;
				};
			};
		};
	};
}

export interface TeamMatchData {
	matchDate: string;
	matchTime: string;
	home: boolean;
	opposingTeamId: string;
	opposingTeamLetter: string;
}

export interface Team {
	teamName: string;
	teamId: string;
	matchesData: {
		[dateKey: string]: TeamMatchData;
	};
}
