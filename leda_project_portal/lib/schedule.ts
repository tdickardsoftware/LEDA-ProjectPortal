export interface TeamData {
	teamId: string;
	placeId: string;
	teamName: string;
}

export interface MatchData {
	matchDate: string;
	matchTime: string;
	home: boolean;
	opposingTeamId: string;
	opposingTeamLetter: string;
	subdivisionId?: string;
}

export interface TeamMatchData {
	teamName: string;
	teamId: string;
	matchesData: Record<string, MatchData>;
}

export interface SubdivisionData {
	[teamLetter: string]: TeamData;
}

export interface DivisionData {
	subdivisions: Record<string, SubdivisionData>;
}

export interface DivisionsData {
	[division: string]: DivisionData;
}

export interface ScheduleData {
	[division: string]: {
		[subdivision: string]: {
			[teamLetter: string]: TeamMatchData;
		};
	};
}

export interface DeleteMatchupState {
	teamLetter: string;
	gameTitle: string;
}

export interface EditMatchupState {
	teamLetter: string;
	gameTitle: string;
	matchData: MatchData;
}

export interface SeasonApiResponse {
	dates: Record<string, string>;
}

export interface RosterApiResponse {
	teamInfomation: DivisionsData;
}

export interface ScheduleApiResponse {
	scheduleData: ScheduleData;
}

export interface PlaceApiResponse {
	name: string;
}
