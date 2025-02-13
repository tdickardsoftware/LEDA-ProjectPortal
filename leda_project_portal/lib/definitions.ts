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
}