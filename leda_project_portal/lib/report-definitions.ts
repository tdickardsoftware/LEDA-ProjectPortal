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

// Column definitions for leaguePlayBarAffiliationFeeNotPaid report
export const leaguePlayBarAffiliationFeeNotPaidColumns = [
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "ledaId",
		header: "Place LEDA ID",
		accessor: (row: { ledaId: string }) => row.ledaId,
		sortable: true,
	},
	{
		key: "name",
		header: "Bar Name",
		accessor: (row: { name: string }) => row.name,
		sortable: true,
	},
];

// Column definitions for mentionBestOfDivision report
export const mentionBestOfDivisionColumns = [
	{
		key: "ledaId",
		header: "Player LEDA ID",
		accessor: (row: { ledaId: string }) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Player Full Name ",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "teamId",
		header: "Team LEDA ID",
		accessor: (row: { teamId: string }) => row.teamId,
		sortable: true,
	},
	{
		key: "teamName",
		header: "Team Name",
		accessor: (row: { teamName: string }) => row.teamName,
		sortable: true,
	},
	{
		key: "division",
		header: "Division",
		accessor: (row: { division: string }) => row.division,
		sortable: true,
	},
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "mentionCode",
		header: "Mention Code",
		accessor: (row: { mentionCode: string }) => row.mentionCode,
		sortable: true,
	},
	{
		key: "mentionDesc",
		header: "Mention Description",
		accessor: (row: { mentionDesc: string }) => row.mentionDesc,
		sortable: true,
	},
	{
		key: "mentionBasis",
		header: "Mention Basis",
		accessor: (row: { mentionBasis: string }) => row.mentionBasis,
		sortable: true,
	},
	{
		key: "mentionCount",
		header: "Mention Count",
		accessor: (row: { mentionCount: string }) => row.mentionCount,
		sortable: true,
	},
]

// Column definitions for mentionPlaque report
export const mentionPlaqueColumns = [
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "ledaId",
		header: "Player LEDA ID",
		accessor: (row: { ledaId: string }) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Player Full Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "division",
		header: "Division",
		accessor: (row: { division: string }) => row.division,
		sortable: true,
	},
	{
		key: "divisionInfo",
		header: "Division Info",
		accessor: (row: { divisionInfo: string }) => row.divisionInfo,
		sortable: true,
	},
	{
		key: "teamName",
		header: "Team Name",
		accessor: (row: { teamName: string }) => row.teamName,
		sortable: true,
	},
	{
		key: "mentionsCount",
		header: "Mentions Count",
		accessor: (row: { mentionsCount: string }) => row.mentionsCount,
		sortable: true,
	},
	{
		key: "mentions",
		header: "Mentions",
		accessor: (row: { mentions: { mentionDesc: string; count: number }[] }) =>
			Array.isArray(row.mentions)
				? row.mentions
						.map(
							(m: { mentionDesc: string; count: number }) =>
								`${m.mentionDesc} - ${m.count}`
						)
						.join("\n")
				: "",
		sortable: true,
	},
];

// Column definitions for mentionLeaguePlay report
export const mentionLeaguePlayColumns = [
	{
		key: "ledaId",
		header: "Player LEDA ID",
		accessor: (row: { ledaId: string }) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Player Full Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "isCaptain",
		header: "Is Captain",
		accessor: (row: { isCaptain: boolean }) => (row.isCaptain ? "Yes" : "No"),
		sortable: true,
	},
	{
		key: "teamId",
		header: "Team LEDA ID",
		accessor: (row: { teamId: string }) => row.teamId,
		sortable: true,
	},
	{
		key: "teamName",
		header: "Team Name",
		accessor: (row: { teamName: string }) => row.teamName,
		sortable: true,
	},
	{
		key: "placeName",
		header: "Place Name",
		accessor: (row: { placeName: string }) => row.placeName,
		sortable: true,
	},
	{
		key: "divisionInfo",
		header: "Division Info",
		accessor: (row: { divisionInfo: string }) => row.divisionInfo,
		sortable: true,
	},
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "mentionsCount",
		header: "Mentions Count",
		accessor: (row: { mentionsCount: string }) => row.mentionsCount,
		sortable: true,
	},
	{
		key: "mentions",
		header: "Mentions",
		accessor: (row: { mentions: { weekNum: string; mentionCode: string; mentionDesc: string; count: string; }[] }) =>
			Array.isArray(row.mentions)
				? row.mentions
						.map(
							(m: { weekNum: string; mentionCode: string; mentionDesc: string; count: string; }) =>
								`Week # ${m.weekNum} - ${m.mentionCode} (${m.mentionDesc}) - Count: ${m.count}`
						)
						.join("\n")
				: "",
		sortable: true,
	},
];

// Column definitions for ton80 report
export const ton80Columns = [
	{
		key: "ledaId",
		header: "Player LEDA ID",
		accessor: (row: { ledaId: string }) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Player Full Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "teamId",
		header: "Team LEDA ID", 
		accessor: (row: { teamId: string }) => row.teamId,
		sortable: true,
	},
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "weekNum",
		header: "Week Number",
		accessor: (row: { weekNum: string }) => row.weekNum,
		sortable: true,
	},
	{
		key: "t71Cumulative",
		header: "T71 Cumulative",
		accessor: (row: { t71Cumulative: string }) => row.t71Cumulative,
		sortable: true,
	},
	{
		key: "t80Cumulative",
		header: "T80 Cumulative",
		accessor: (row: { t80Cumulative: string }) => row.t80Cumulative,
		sortable: true,
	},
];

// Column definitions for players no form report
export const playerNoFormColumns = [
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "ledaId",
		header: "Player LEDA ID",
		accessor: (row: { ledaId: number }) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "formOnFile",
		header: "Form On File",
		accessor: (row: { formOnFile: boolean }) => (row.formOnFile ? "Yes" : "No"),
		sortable: true,
	},
];

// Column definitions for player not paid report
export const playerNotPaidColumns = [
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "ledaId",
		header: "Player LEDA ID",
		accessor: (row: { ledaId: number }) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
];

// Column definitions for team fee not paid report
export const teamFeeNotPaidColumns = [
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "divisionInfo",
		header: "Division Info",
		accessor: (row: { divisionInfo: string }) => row.divisionInfo,
		sortable: true,
	},
	{
		key: "teamName",
		header: "Team Name",
		accessor: (row: { teamName: string }) => row.teamName,
		sortable: true,
	},
	{
		key: "name",
		header: "Place Name",
		accessor: (row: { name: string }) => row.name,
		sortable: true,
	},
];

// Column definitions for top darter report
export const topDarterColumns = [
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "ledaId",
		header: "Player LEDA ID",
		accessor: (row: { ledaId: number }) => row.ledaId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "teamLedaId",
		header: "Team LEDA ID",
		accessor: (row: { teamLedaId: number }) => row.teamLedaId,
		sortable: true,
	},
	{
		key: "totalPoints",
		header: "Total Points",
		accessor: (row: { totalPoints: number }) => row.totalPoints,
		sortable: true,
	},
	{
		key: "divisionInfo",
		header: "Division Info",
		accessor: (row: { divisionInfo: string }) => row.divisionInfo,
		sortable: true,
	},
];

// Column definitions for weekly scoresheets report
export const weeklyScoresheetsColumns = [
	{
		key: "seasonCode",
		header: "Season Code",
		accessor: (row: { seasonCode: string }) => row.seasonCode,
		sortable: true,
	},
	{
		key: "teamLedaId",
		header: "Team LEDA ID",
		accessor: (row: { teamLedaId: string }) => row.teamLedaId,
		sortable: true,
	},
	{
		key: "teamName",
		header: "Team Name",
		accessor: (row: { teamName: string }) => row.teamName,
		sortable: true,
	},
	{
		key: "placeName",
		header: "Place Name",
		accessor: (row: { placeName: string }) => row.placeName,
		sortable: true,
	},
	{
		key: "weekNum",
		header: "Week Number",
		accessor: (row: { weekNum: string }) => row.weekNum,
		sortable: true,
	},
	{
		key: "divisionInfo",
		header: "Division Info",
		accessor: (row: { divisionInfo: string }) => row.divisionInfo,
		sortable: true,
	},
	{
		key: "division",
		header: "Division",
		accessor: (row: { division: string }) => row.division,
		sortable: true,
	},
	{
		key: "subdivision",
		header: "Subdivision",
		accessor: (row: { subdivision: string }) => row.subdivision,
		sortable: true,
	},
	{
		key: "teamLetter",
		header: "Team Letter",
		accessor: (row: { teamLetter: string }) => row.teamLetter,
		sortable: true,
	},
	{
		key: "prevTotalPoints",
		header: "Previous Total Points",
		accessor: (row: { prevTotalPoints: string }) => row.prevTotalPoints,
		sortable: true,
	},
	{
		key: "totalPoints",
		header: "Total Points",
		accessor: (row: { totalPoints: string }) => row.totalPoints,
		sortable: true,
	},
	{
		key: "pointsScored",
		header: "Points Scored",
		accessor: (row: { pointsScored: string }) => row.pointsScored,
		sortable: true,
	},
	{
		key: "penaltyPoints",
		header: "Penalty Points",
		accessor: (row: { penaltyPoints: string }) => row.penaltyPoints,
		sortable: true,
	},
	{
		key: "previousPenaltyPoints",
		header: "Previous Penalty Points",
		accessor: (row: { previousPenaltyPoints: string }) => row.previousPenaltyPoints,
		sortable: true,
	},
];

// Column definitions for captains report
export const captainsReportColumns = [
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "ledaId",
		header: "LEDA ID",
		accessor: (row: { ledaId: string }) => row.ledaId,
		sortable: true,
	},
	{
		key: "phoneNumber",
		header: "Phone Number",
		accessor: (row: { phoneNumber: string }) => row.phoneNumber,
		sortable: true,
	},
	{
		key: "teamName",
		header: "Team Name",
		accessor: (row: { teamName: string }) => row.teamName,
		sortable: true,
	},
	{
		key: "Division",
		header: "Division",
		accessor: (row: { divisionInfo: string }) => row.divisionInfo,
		sortable: true,
	},
	{
		key: "placeName",
		header: "Place Name",
		accessor: (row: { placeName: string }) => row.placeName,
		sortable: true,
	},
]

// Column definitions for lists election list
export const electionListColumns = [
	{
		key: "fullName",
		header: "Full Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
]

// Column Definitions for the lists membership list filter by season
export const membershipListColumnsFilterBySeason = [
	{
		key: "playerId",
		header: "LEDA ID",
		accessor: (row: { playerId: string }) => row.playerId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "phoneNumber",
		header: "Phone Number",
		accessor: (row: { phoneNumber: string }) => row.phoneNumber,
		sortable: true,
	},
	{
		key: "email",
		header: "Email",
		accessor: (row: { email: string }) => row.email,
		sortable: true,
	},
	{
		key: "addressOne",
		header: "Address Line 1",
		accessor: (row: { addressOne: string }) => row.addressOne,
		sortable: true,
	},
	{
		key: "addressTwo",
		header: "Address Line 2",
		accessor: (row: { addressTwo: string }) => row.addressTwo,
		sortable: true,
	},
	{
		key: "city",
		header: "City",
		accessor: (row: { city: string }) => row.city,
		sortable: true,
	},
	{
		key: "state",
		header: "State",
		accessor: (row: { state: string }) => row.state,
		sortable: true,
	},
	{
		key: "zip",
		header: "Zip Code",
		accessor: (row: { zip: string }) => row.zip,
		sortable: true,
	},
	{
		key: "divisionInfo",
		header: "Division Info",
		accessor: (row: { divisionInfo: string }) => row.divisionInfo,
		sortable: true,
	}
]

// Column Definitions for the lists membership list filter by join date
export const membershipListColumnsFilterByJoinDate = [
	{
		key: "playerId",
		header: "LEDA ID",
		accessor: (row: { playerId: string }) => row.playerId,
		sortable: true,
	},
	{
		key: "fullName",
		header: "Name",
		accessor: (row: { fullName: string }) => row.fullName,
		sortable: true,
	},
	{
		key: "phoneNumber",
		header: "Phone Number",
		accessor: (row: { phoneNumber: string }) => row.phoneNumber,
		sortable: true,
	},
	{
		key: "email",
		header: "Email",
		accessor: (row: { email: string }) => row.email,
		sortable: true,
	},
	{
		key: "addressOne",
		header: "Address Line 1",
		accessor: (row: { addressOne: string }) => row.addressOne,
		sortable: true,
	},
	{
		key: "addressTwo",
		header: "Address Line 2",
		accessor: (row: { addressTwo: string }) => row.addressTwo,
		sortable: true,
	},
	{
		key: "city",
		header: "City",
		accessor: (row: { city: string }) => row.city,
		sortable: true,
	},
	{
		key: "state",
		header: "State",
		accessor: (row: { state: string }) => row.state,
		sortable: true,
	},
	{
		key: "zip",
		header: "Zip Code",
		accessor: (row: { zip: string }) => row.zip,
		sortable: true,
	}
]