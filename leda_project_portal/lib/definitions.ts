//
//Define type to identify the shape of our data coming from postgres for players
//
export type Player = {
	ledaId: number;
	fullName: string;
	lastName: string;
	firstName: string;
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
};
//
// Define type to identify the shape of our data from postgres for Seasons
//
export type PlayerMemberInfo = {
	ledaId: number;
	fullName?: string;
	lastName: string;
	firstName: string;
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
// Define type to identify the shape of our data from postgres for a Schedule
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
	ledaId: number;
	prevTotalPoints: number;
	totalPoints: number;
};
//
// Define type to indentify the shape of our data from postgres for weekly player scores
//
export type PlayerPoints = {
	seasonCode: string;
	weekNum: number;
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