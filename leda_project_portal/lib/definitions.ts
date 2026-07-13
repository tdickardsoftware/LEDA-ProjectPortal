/**
 * Shared TypeScript type definitions for the LEDA portal.
 *
 * Every type in this file mirrors the shape of a PostgreSQL row (or a
 * projection of one) returned by the API layer. Types are organised by
 * domain area: players, teams, places, maintenance lookups, activities,
 * scoring, payments, reports, and users.
 *
 * Import individual types as needed rather than using a wildcard import
 * so unused definitions are tree-shaken by the bundler.
 */
//
//Define type to identify the shape of our data coming from postgres for players
//
export type Player = {
	ledaId: number;
	fullName: string;
	lastName: string;
	firstName: string;
	nickname?: string;
	middleInitial: string;
	addressOne: string;
	addressTwo: string;
	city: string;
	state: string;
	zip: string;
	phoneNumber: string;
	phoneNumberFormatted?: string;
	otherNumber?: string;
	otherNumberFormatted?: string;
	email: string;
	gender: string;
	dateOfBirth: Date;
};
//
// Define type to identify the shape of our data coming from postgres for place owner selector
//
export type PlaceOwner = {
	ledaId: number;
	fullName: string;
};
//
//Define type to identify the shape of our data from postgres for players for datatable
//
export type PlayerDataTable = {
	ledaId: number;
	fullName: string;
	phoneNumber: string;
	email: string;
};
//
// Define type to identify the shape of our data from postgres for players for selector
//
export type PlayerSelector = {
	ledaId: number;
	fullName: string;
	cannotBeCaptain: boolean;
};
//
// Define type to identify the shape of our data from postgres for single player selector
//
export type PlayerSingleSelector = {
	ledaId: number;
	fullName: string;
};
//
//Define type to identify the shape of our data from postgres for teams
//
export type Team = {
	ledaId: number;
	teamName: string;
	establishedDate: Date;
	memo: string;
	lastTeamFeePayment: string;
	memberIdList: JSON;
};
//
// Define type to identify the shape of our data from postgres for teams for datatable
//
export type TeamDataTable = {
	ledaId: number;
	teamName: string;
	memo: string;
	establishedDate: Date;
	lastTeamFeePayment: string;
};
//
//Define type to identify the shape of our data from postgres for places
//
export type Place = {
	ledaId: number;
	name: string;
	addressFull: string;
	addressOne: string;
	addressTwo: string;
	city: string;
	state: string;
	zip: string;
	phoneNumber: string;
	otherNumber: string;
	email: string;
	website: string;
	establishDate: Date;
	memo: string;
	numberOfBoards: number;
	sendMailings: boolean;
	regularSponsor: boolean;
	currentSponsor: boolean;
	issues: boolean;
	lastBarFeePayment: string;
	lastSanctioningDate: Date;
	contactId: number;
	placeType: string;
};
//
// Define type to identify the shape of our data from postgres for places for selector
//
export type PlaceSelector = {
	ledaId: number;
	name: string;
	numberOfBoards: number;
};
//
// Define type to identify the shape of our data from postgres for place datatable
// 
export type PlaceDataTable = {
	ledaId: number;
	name: string;
	addressFull: string;
	phoneNumber: string;
	placeType: string;
};
//
//Define type to identify the shape of our data from postgres for divisions
//
export type Division = {
	divisionName: string;
};
//
//Define type to identify the shape of our data from postgres for mentions
//
export type Mention = {
	mentionCode: string;
	desc: string;
	points: number;
	mentionBasis: string;
};
//
//Define type to identify the shape of our data from postgres for Payment Types
//
export type PaymentType = {
	paymentType: string;
	desc: string;
};
//
//Define type to identify the shape of our data from postgres for Payout Tiers
//
export type PayoutTier = {
	place: number;
	amount: number;
};
//
//Define type to identify the shape of our data from postgres for Penalties
//
export type Penalty = {
	penaltyCode: string;
	desc: string;
};
//
//Define type to identify the shape of our data from postgres for People Types
//
export type PeopleType = {
	peopleTypeCode: string;
	desc: string;
};
//
//Define type to identify the shape of our data from postgres for Place Types
//
export type PlaceType = {
	placeTypeCode: string;
	desc: string;
};
//
//Define type to identify the shape of our data from postgres for Seasons
//
export type Season = {
	seasonCode: string;
	desc: string;
	fiscalYear: string;
	dates: JSON;
	isCurrentSeason: boolean;
	backupPlaceId?: string | null;
};
//
// Define type to identify the shape of our data from postgres for Seasons Datatable
//
export type SeasonDataTable = {
	seasonCode: string;
	desc: string;
	fiscalYear: string;
	isCurrentSeason: boolean;
};
//
// Define type to identify the shape of our data from postgres for Seasons
//
export type PlayerMemberInfo = {
	ledaId: number;
	fullName?: string;
	lastName: string;
	firstName: string;
	nickname?: string;
	middleInitial?: string;
	addressOne: string;
	addressTwo?: string;
	city: string;
	state: string;
	zip: string;
	phoneNumber: string;
	phoneNumberFormatted?: string;
	otherNumber?: string;
	otherNumberFormatted?: string;
	email: string;
	gender: string;
	dateOfBirth: Date;
	establishedDate: Date;
	badStanding: boolean;
	badStandingReason?: string;
	takeOffMailing: boolean;
	mailStandings: boolean;
	formOnFile: boolean;
	needsMemberCard: boolean;
	inactiveDate?: Date;
	lastMembershipFeePayment: string;
	lastTrailsDate?: Date;
	memberType: string;
	cannotBeCaptain: boolean;
	lifetimeMember: boolean;
	lifetimeMemberReason?: string;
};
//
// Define type for temporary player records
//
export type TempPlayer = {
	tempId: number;
	firstName: string;
	middleInitial?: string;
	lastName: string;
};
//
// Define type to identify the shape of our data from postgres for Trails Dates
//
export type TrailsDate = {
	trailsDate: string;
};
//
// Define type to identify the shape of our data from postgres for a Trails Date Data
//
export type TrailsDateData = {
	ledaId: number;
	trailsDate: string;
	notes?: string;
	singlesPlace: number;
	doublesPlace: number;
	trailsPoints: number;
	fullName: string;
};
//
// define type to identify te shape of our data from postgres for a Roster
//
export type Roster = {
	seasonCode: string;
	teamInformation: JSON;
};
//
// Define type to identify the shape of our data from postgres for a Schedule (DEPRECATED - now normalized)
// Note: The API now stores schedule as normalized rows but returns it in nested format for backward compatibility
//
export type Schedule = {
	seasonCode: string;
	scheduleData: JSON;
};
//
// Define type to identify the shape of our data from postgres for a Weekly Scoresheet
//
export type WeeklyScoresheet = {
	seasonCode: string;
	weekNumber: number;
	scoresheetData: JSON;
	finishedScoresheet: boolean;
};
//
// Define type to identify the shape of our data from postgres for weekly team scores
//
export type TeamPoints = {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: string;
	ledaId: number;
	prevTotalPoints: number;
	totalPoints: number;
};
//
// Define type to identify the shape of our data from postgres for weekly player scores
//
export type PlayerPoints = {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: string;
	ledaId: number;
	prevTotalPoints: number;
	totalPoints: number;
	teamLedaId: number;
};
//
// Define type to identify the shape of our data from postgres for a Payout
//
export type Payout = {
	seasonCode: string;
	payoutsData: JSON;
};
//
// Define type to identify the shape of our data from postgres for a Trails Player History
//
export type TrailsPlayerHistory = {
	trailsDate: string;
	previousTotalPoints: number;
	totalPoints: number;
	changeBy: number;
	modifyDate: Date;
	singlesPlace: number;
	doublesPlace: number;
};
//
// Define type to identify the shape of our data from postgres for a Mention Player History
//
export type MentionPlayerHistory = {
	ledaId: string;
	mentionCode: string;
	mentionDesc: string;
	mentionPoints: number;
	seasonCode: string;
	weekNum: number;
	notes: string;
	mentionId: string;
	creationDate?: Date;
	count: number;
	teamId: number;
};
//
// Define type to identify the shape of our data from postgres for top darter seasons and points
//
export type TopDarterTotals = {
	seasonCode: string;
	totalPoints: number;
};
//
// Define type to identify the shape of our data from postgres for Weekly Top Darter Scores
//
export type WeeklyTopDarterScores = {
	weekNum: number;
	totalPoints: number;
	gameName: string;
	changeBy: number;
	prevTotalPoints: number;
	teamLedaId: number;
	teamName: string;
};
//
// Define type to identify the shape of our data from postgres for Player Roster History
//
export type PlayerRosterHistory = {
	player_id: number;
	team_id: number;
	team_letter: string;
	team_name: string;
	division: string;
	subdivision: string;
	seasonCode: string;
	totalPoints: number;
	place: number;
};
//
// Define type to identify the shape of our data from postgres for Payment History
//
export type PaymentHistory = {
	paymentNbr: number;
	ledaId: number;
	type: string;
	paymentType: string;
	amount: string;
	seasonCode: string;
	comp: boolean;
	notes: string;
	paidOff: boolean;
	date: Date;
	fullName?: string;
	fiscalYear?: string;
};
//
// Define type to identify the shape of our data from postgres for SeasonCode data
//
export type SeasonCode = {
	seasonCode: string;
	desc?: string;
	isCurrentSeason?: boolean;
};
//
// Define type to identify the shape of our data from postgres for a history view
//
export type HistoryView = {
	seasonCode: string;
	ledaId: number;
};
//
// Define type to identify the shape of our data from postgres for a place team history view
//
export type PlaceTeamHistoryView = {
	seasonCode: string;
	teamName: string;
	teamId: number;
	placeId: number;
	placeName: string;
};
//
// Define type to identify the shape of our data from postgres for a trails history of wins
//
export type TrailsHistoryOfWins = {
	ledaId: number;
	fullName: string;
	singlesPlace1: number;
	singlesPlace2: number;
	singlesPlace3: number;
	singlesPlace4: number;
	doublesPlace1: number;
	doublesPlace2: number;
	doublesPlace3: number;
	doublesPlace4: number;
}
//
// Define type to identify the shape of our data from postgres for a trails history of wins
//
export type TrailsTripEligible = {
	ledaId: number;
	fullName: string;
	addressFull: string;
	totalpoints: number;
}
//
// Define type to identify the shape of our data from postgres for a trails membership history
//
export type TrailsMembershipHistory = {
	ledaId: number;
	fullName: string;
}
//
// Define type to identify the shape of our data from postgres for a trails points list
//
export type TrailsPointsList = {
	ledaId: number;
	previousTotalPoints: number;
	totalPoints: number;
	changeBy: number;
	trailsDate: Date;
	fullname: string;
	paidDues: boolean;
}
//
// Define type to identify the shape of our data from postgres for a trails save points letter
//
export type TrailsSavePointsLetter = {
	ledaId: number;
	fullName: string;
	addressFirstLine: string;
	addressSecondLine: string;
	lastTrailsDate: Date;
	totalpoints: number;
};
//
// Define type to identify the shape of our data from postgres for the folder label report
//
export type CaptainsMtgFolderLabels = {
	teamName: string;
	placeName: string;
	captainFullName: string;
	divisionLetter: string;
	subdivisionNumber: string;
	teamLetter: string;
}
//
// Define type to identify the shape of our data from postgres for the team report - specifically on the team member info portion
//
export type TeamReportTeamMemberInfo = {
	teamId: number;
	playerId: number;
	isCaptain: string;
	fullName: string;
	phoneNumber: string;
	needForm: string;
	datesDuesPaid: string;
}
//
// Define type to identify the shape of our data from postgres for the team report - specifically on the team/place info portion
//
export type TeamReportTeamPlaceInfo = {
	teamId: number;
	teamName: string;
	placeId: number;
	divisionName: string;
	subdivisionNumber: string;
	placeName: string;
	phoneNumber: string;
	addressFirstLine: string;
	addressSecondLine: string;
	seasonCode: string;
	teamLetter: string;
	paidStatus: boolean;
	desc: string;
	playerArray: TeamReportTeamMemberInfo[];
}
//
// Define type to identify the shape of our data from postgres for the captains meeting schedule place captain season info
//
export type CaptainsMtgSchedulePlaceCaptainSeasonInfo = {
	seasonCode: string;
	desc: string;
	teamId: number;
	placeId: number;
	division: string;
	subdivision: string;
	placeName: string;
	addressFirstLine: string;
	addressSecondLine: string;
	placePhoneNumber: string;
	captainId: number;
	captainFullName: string;
	captainPhoneNumber: string;
};
//
// Define type to identify the shape of our data from postgres for the league play players no form report
//
export type PlayerNoForm= {
	seasonCode: string;
	ledaId: number;
	formOnFile: boolean;
	fullName: string;
}
//
// Define type to identify the shape of our data from postgres for the league play bar affiliation fee not paid report
//
export type BarAffiliationFeeNotPaid = {
	seasonCode: string;
	ledaId: string;
	name: string;
}
//
// Define type to identify the shape of our data from postgres for the league play player not paid report
//
export type PlayerNotPaid = {
	seasonCode: string;
	ledaId: number;
	fullName: string;
}
//
// Define type to identify the shape of our data from postgres for the league play team fee not paid report
//
export type TeamFeeNotPaid = {
	seasonCode: string;
	divisionInfo:string;
	teamName: string;
	name: string;
}
//
// Define type to identify the shape of our data from postgres for the league play top darter report
//
export type TopDarter = {
	seasonCode: string;
	ledaId: number;
	fullName: string;
	teamLedaId: number;
	totalPoints: number;
	divisionInfo: string;
}
//
// Define type to identify the shape of our data from postgres for the league play ton 80 report
//
export type Ton80 = {
	ledaId: string;
	fullName: string;
	teamId: string;
	seasonCode: string;
	weekNum: string;
	t71Cumulative: string;
	t80Cumulative: string;
}
//
// Define type to identify the shape of our data from postgres for the league play mentions plaque report
//
export type MentionPlaque = {
	seasonCode: string;
	ledaId: string;
	fullName: string;
	division: string;
	divisionInfo: string;
	teamName: string;
	mentionsCount: string;
	mentions: { mentionDesc: string; count: number }[]; // <-- updated
}
//
// Define type to identify the shape of our data from postgres for the league play mentions best of division report
//
export type MentionBestOfDivision = {
	ledaId: string;
	fullName: string;
	teamId: string;
	teamName: string;
	division: string;
	seasonCode: string;
	mentionCode: string;
	mentionDesc: string;
	mentionBasis: string;
	mentionCount: string;
}
//
// Define type to identify the shape of our data from postgres for the league play mentions report
//
export type MentionLeaguePlay = {
	ledaId: string;
	fullName: string;
	isCaptain: boolean;
	teamId: string;
	teamName: string;
	placeName: string;
	divisionInfo: string;
	seasonCode: string;
	mentionsCount: string;
	mentions: { weekNum: string; mentionCode: string; mentionDesc: string; count: string;}[]
}
//
// Define type to identify the shape of our data from postgres for the league play weekly scoresheets report
//
export type LeaguePlayWeeklyScoresheets = {
	seasonCode: string;
	teamLedaId: string;
	teamName: string;
	placeName: string;
	weekNum: string;
	divisionInfo: string;
	division: string;
	subdivision: string;
	teamLetter: string;
	prevTotalPoints: string;
	totalPoints: string;
	pointsScored: string;
	penaltyPoints: string;
	previousPenaltyPoints: string;
};
//
// Define type to identify the shape of our data from postgres for the lists captains report
//
export type ListsCaptains = {
	ledaId: string;
	fullName: string;
	seasonCode: string;
	teamName: string;
	placeName: string;
	division: string;
	divisionInfo: string;
	phoneNumber: string;
}
//
// Define type to identify the shape of our data from postgres for the lists election list report
//
export type ListsElectionList = {
	fullName: string;
	badStanding: boolean;
}
//
// Define type to identify the shape of our data from postgres for the lists membership report
//
export type ListsMembership = {
	playerId: string;
	fullName: string;
	phoneNumber: string;
	email: string;
	addressOne: string;
	addressTwo: string;
	city: string;
	state: string;
	zip: string;
	divisionInfo: string;
}
//
// Define type to identify the shape of our data from postgres for the lists places report
//
export type ListsPlaces = {
	ledaId: string;
	name: string;
	email: string;
	addressOne: string;
	addressTwo: string;
	city: string;
	state: string;
	zip: string;
	phoneNumber: string;
	contact: string;
}
//
// Define type to identify the shape of our data from postgres for the lists teams report
//
export type ListsTeams = {
	teamId: string;
	teamName: string;
	placeName: string;
	addressFirstLine: string;
	addressSecondLine: string;
	placePhoneNumber: string;
	captainFullName: string;
	captainPhoneNumber: string;
	divisionInfo: string;
}
//
// Define type to identify the shape of our data from postgres for divisions in a roster
//
export type RosterDivision = {
	seasonCode: string;
	division: string;
}
//
// Define type to identify the shape of our data from postgres for fiscal years
//
export type FiscalYear = {
	fiscalYear: string;
}
//
// Define type to identify the shape of our data from postgres for mailing lists
//
export type MailingList = {
	ledaId: string;
	name: string;
	addressLineOne: string;
	addressLineTwo: string;
	type: string;
};
//
// Define type to identify the shape of our data from postgres for a user
//
export type minimalUser = {
	username: string;
	email: string;
}
//
// Define type to identify the shape of our data from postgres for an email one time token
//
export type EmailOneTimeToken = {
	email: string;
	token: string;
	creationDateTime: Date;
	expirationDateTime: Date;
}
//
// Define type to identify the shape of our data from postgres for a user role
//
export type UserRole = {
	username: string;
	role: string;
}
//
// Define type to identify the shape of our data from postgres for weekly scoresheets team info
//
export type WeeklyScoresheetsTeamInfo = {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: number;
	home: boolean;
	teamId: number;
	teamName: string;
	teamLetter: string;
	teamLabel: string;
	opposingTeamId: number;
	penalties: JSON;
}
//
// Define type to identify the shape of our data from postgres for weekly scoresheets game info
//
export type WeeklyScoresheetsGameInfo = {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: number;
	homeTeamId: number;
	awayTeamId: number;
	homePoints: number;
	awayPoints: number;
	gameInfo: JSON;
	completed: boolean;
}
//
// Define type to identify the shape of our data from postgres for weekly scoresheets player info
//
export type WeeklyScoresheetsPlayerInfo = {
	seasonCode: string;
	weekNum: number;
	division: string;
	subdivision: number;
	ledaId: number;
	teamId: number;
	gameStats: JSON;
}
//
// Define type to identify the shape of our data from postgres for weekly scoresheets matchup info
//
export type WeeklyScoresheetsMatchupInfo = {
	seasonCode: string;
	weekNum: number;
	matchupData: JSON;
};
//
// Define type to identify the shape of our data from postgres for weekly scoresheets scoresheet count
//
export type WeeklyScoresheetsScoresheetCount = {
	seasonCode: string;
	expectedScoresheets: number;
	completedScoresheets: number;
	totalWeeks: number;
};
//
// Define type to identify the shape of our data from postgres for weekly scoresheets bye weeks processed
//
export type WeeklyScoresheetsByeWeeksProcessed = {
	seasonCode: string;
	weekNum: number;
	allByeWeeksProcessed: boolean;
};
//
// Define type to identify the shape of our data from postgres for weekly scoresheets completed week
//
export type WeeklyScoresheetsCompletedWeek = {
	seasonCode: string;
	weekNum: number;
	scoresheetsProcessed: boolean;
};
//
// Define type to identify the shape of our data from postgres for weekly scoresheets scoresheet team info 
//
export type WeeklyScoresheetsScoresheetTeamInfo = {
	seasonCode: string;
	ledaid: number;
	teamLetter: string;
}
//
// Define type to identify the shape of our data from postgres for maintenance calendar blocked dates
//
export type Calendar = {
	date: Date;
	desc: string;
};