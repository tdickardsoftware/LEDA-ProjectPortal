import {
	TrailsHistoryOfWins,
	TrailsTripEligible,
	TrailsMembershipHistory,
	TrailsPointsList,
	TrailsSavePointsLetter,
	CaptainsMtgFolderLabels,
	TeamReportTeamPlaceInfo,
} from "./definitions";

// Column definitions for historyOfWins report
export const historyOfWinsColumns = [
	{
		key: "ledaId",
		header: "LEDA ID",
		accessor: (row: TrailsHistoryOfWins) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: TrailsHistoryOfWins) => row.fullName,
		sortable: true,
	},
	{
		key: "singlesPlace1",
		header: "Singles 1st",
		accessor: (row: TrailsHistoryOfWins) => row.singlesPlace1 || 0,
		sortable: true,
	},
	{
		key: "singlesPlace2",
		header: "Singles 2nd",
		accessor: (row: TrailsHistoryOfWins) => row.singlesPlace2 || 0,
		sortable: true,
	},
	{
		key: "singlesPlace3",
		header: "Singles 3rd",
		accessor: (row: TrailsHistoryOfWins) => row.singlesPlace3 || 0,
		sortable: true,
	},
	{
		key: "singlesPlace4",
		header: "Singles 4th",
		accessor: (row: TrailsHistoryOfWins) => row.singlesPlace4 || 0,
		sortable: true,
	},
	{
		key: "doublesPlace1",
		header: "Doubles 1st",
		accessor: (row: TrailsHistoryOfWins) => row.doublesPlace1 || 0,
		sortable: true,
	},
	{
		key: "doublesPlace2",
		header: "Doubles 2nd",
		accessor: (row: TrailsHistoryOfWins) => row.doublesPlace2 || 0,
		sortable: true,
	},
	{
		key: "doublesPlace3",
		header: "Doubles 3rd",
		accessor: (row: TrailsHistoryOfWins) => row.doublesPlace3 || 0,
		sortable: true,
	},
	{
		key: "doublesPlace4",
		header: "Doubles 4th",
		accessor: (row: TrailsHistoryOfWins) => row.doublesPlace4 || 0,
		sortable: true,
	},
];

// Column definitions for trip eligible report
export const tripEligibleColumns = [
	{
		key: "ledaId",
		header: "LEDA ID",
		accessor: (row: TrailsTripEligible) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: TrailsTripEligible) => row.fullName,
		sortable: true,
	},
	{
		key: "addressFull",
		header: "Address",
		accessor: (row: TrailsTripEligible) => row.addressFull,
		sortable: true,
	},
	{
		key: "totalpoints",
		header: "Total Points",
		accessor: (row: TrailsTripEligible) => row.totalpoints,
		sortable: true,
	},
];

// Column definitions for membership history report
export const membershipHistoryColumns = [
	{
		key: "ledaId",
		header: "LEDA ID",
		accessor: (row: TrailsMembershipHistory) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: TrailsMembershipHistory) => row.fullName,
		sortable: true,
	},
];

// Column definitions for points list report
export const pointsListColumns = [
	{
		key: "ledaId",
		header: "LEDA ID",
		accessor: (row: TrailsPointsList) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullname",
		header: "Full Name",
		accessor: (row: TrailsPointsList) => row.fullname,
		sortable: true,
	},
	{
		key: "previousTotalPoints",
		header: "Previous Points",
		accessor: (row: TrailsPointsList) => row.previousTotalPoints,
		sortable: true,
	},
	{
		key: "totalPoints",
		header: "Total Points",
		accessor: (row: TrailsPointsList) => row.totalPoints,
		sortable: true,
	},
	{
		key: "changeBy",
		header: "Change",
		accessor: (row: TrailsPointsList) => row.changeBy,
		sortable: true,
	},
	{
		key: "trailsDate",
		header: "Trails Date",
		accessor: (row: TrailsPointsList) =>
			new Date(row.trailsDate).toLocaleDateString(),
		sortable: true,
	},
	{
		key: "paidDues",
		header: "Paid Dues",
		accessor: (row: TrailsPointsList) => (row.paidDues ? "Yes" : "No"),
		sortable: true,
	},
];

// Column definitions for save points letter report
export const savePointsLetterColumns = [
	{
		key: "ledaId",
		header: "LEDA ID",
		accessor: (row: TrailsSavePointsLetter) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: TrailsSavePointsLetter) => row.fullName,
		sortable: true,
	},
	{
		key: "lastTrailsDate",
		header: "Last Trails Date",
		accessor: (row: TrailsSavePointsLetter) =>
			new Date(row.lastTrailsDate).toLocaleDateString(),
		sortable: true,
	},
	{
		key: "totalpoints",
		header: "Total Points",
		accessor: (row: TrailsSavePointsLetter) => row.totalpoints,
		sortable: true,
	},
];

//Column definition for folder labels report
export const folderLabelsColumns = [
	{
		key: "teamName",
		header: "Team Name",
		accessor: (row: CaptainsMtgFolderLabels) => row.teamName,
		sortable: true,
	},
	{
		key: "placeName",
		header: "Place Name",
		accessor: (row: CaptainsMtgFolderLabels) => row.placeName,
		sortable: true,
	},
	{
		key: "captainFullName",
		header: "Captain Full Name",
		accessor: (row: CaptainsMtgFolderLabels) => row.captainFullName,
		sortable: true,
	},
	{
		key: "divisionLetter",
		header: "Division Letter",
		accessor: (row: CaptainsMtgFolderLabels) => row.divisionLetter,
		sortable: true,
	},
	{
		key: "subdivisionNumber",
		header: "Subdivision Number",
		accessor: (row: CaptainsMtgFolderLabels) => row.subdivisionNumber,
		sortable: true,
	},
	{
		key: "teamLetter",
		header: "Team Letter",
		accessor: (row: CaptainsMtgFolderLabels) => row.teamLetter,
		sortable: true,
	},
];

// Column definitions for team report
export const teamReportColumns = [
	{
		key: "teamName",
		header: "Team Name",
		accessor: (row: TeamReportTeamPlaceInfo) => row.teamName,
		sortable: true,
	},
	{
		key: "divisionName",
		header: "Division",
		accessor: (row: TeamReportTeamPlaceInfo) => row.divisionName,
		sortable: true,
	},
	{
		key: "subdivisionNumber",
		header: "Subdivision",
		accessor: (row: TeamReportTeamPlaceInfo) => row.subdivisionNumber,
		sortable: true,
	},
	{
		key: "teamLetter",
		header: "Team Letter",
		accessor: (row: TeamReportTeamPlaceInfo) => row.teamLetter,
		sortable: true,
	},
	{
		key: "placeName",
		header: "Bar Name",
		accessor: (row: TeamReportTeamPlaceInfo) => row.placeName,
		sortable: true,
	},
	{
		key: "paidStatus",
		header: "Paid",
		accessor: (row: TeamReportTeamPlaceInfo) => (row.paidStatus ? "Yes" : "No"),
		sortable: true,
	},
	{
		key: "playerArray",
		header: "Players",
		accessor: (row: TeamReportTeamPlaceInfo) =>
			Array.isArray(row.playerArray)
				? row.playerArray.map((p: { fullName: string }) => p.fullName).join(", ")
				: "",
		sortable: true,
	},
];