//
// Local Routes
//
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

// Define Route for place owner api
export const placeOwnerRoute = "/api/management/player/placeOwner";
// Define route for players not on the serverside
export const playerRoute = "/api/management/player";
// Define route for players for datatable not on the serverside
export const playersDataTableRoute = "/api/management/player/datatable";
// Define route for places not on the serverside
export const placeRoute = "/api/management/place";
// Define route for place datatable not on the serverside
export const placeDataTableRoute = "/api/management/place/datatable";
// Define route for teams not on the serverside
export const teamRoute = "/api/management/team";
// Define route for division not on the serverside
export const divisionRoute = "/api/maintenance/division";
// Define route for mention not on the serverside
export const mentionRoute = "/api/maintenance/mention";
// Define route for paymentType not on the serverside
export const paymentTypeRoute = "/api/maintenance/paymentType";
// Define route for payoutTier not on the serverside
export const payoutTierRoute = "/api/maintenance/payoutTier";
// Define route for penalty not on the serverside
export const penaltyRoute = "/api/maintenance/penalty";
// Define route for peopleType not on the serverside
export const peopleTypeRoute = "/api/maintenance/peopleType";
// Define route for placeType not on the serverside
export const placeTypeRoute = "/api/maintenance/placeType";
// Define route for season not on the serverside
export const seasonRoute = "/api/maintenance/season";
// Define route for seasonCode not on the serverside
export const seasonCodeRoute = "/api/maintenance/season/seasonCode";
// Define route for trailsDate not on the serverside
export const trailsDateRoute = "/api/activities/trails/trailsDates";
// Define route for trails not on the serverside
export const trailsRoute = "/api/activities/trails";
// Define route for roster not on the serverside
export const rosterRoute = "/api/activities/roster";
// Define route for schedule not on the serverside
export const scheduleRoute = "/api/activities/schedule";
// Define route for weekly scoresheets not on serverside
export const weeklyScoresheetsRoute = "/api/activities/scoresheets";
// Define route for scoresheet count not on serverside
export const scoresheetCountRoute = "/api/activities/scoresheets/weeklyScoresheetsV2/scoresheetCount";
// Define route for roster team view not on serverside
export const rosterTeamViewRoute = "/api/activities/roster/rosterTeamView";
// Define route for member info not on serverside
export const memberInfoRoute = "/api/management/team/memberInfo";
// Define route for payout not on the serverside
export const payoutRoute = "/api/activities/payout";
// Define route for trailsPlayerHistory not on the serverside
export const trailsPlayerHistoryRoute =
	"/api/activities/trails/trailsPlayerHistory";
// Define route for mentionPlayerHistory not on the serverside
export const mentionPlayerHistoryRoute =
	"/api/maintenance/mention/mentionHistory";
// Define route for playerPaymentHistory not on the serverside
export const playerPaymentHistoryRoute =
	"/api/maintenance/payment/playerPayment";
// Define route for teamPaymentHistory not on the serverside
export const teamPaymentHistoryRoute = "/api/maintenance/payment/teamPayment";
// Define route for placePaymentHistory not on the serverside
export const placePaymentHistoryRoute = "/api/maintenance/payment/placePayment";
// Define route for Users not on the serverside
export const userRoute = "/api/user";

//
// Server Routes
//

// Define Route for players api
export const playerRouteServer =
	"http://" + process.env.VERCEL_URL + playerRoute;
// Define Route for places api
export const placeRouteServer = "http://" + process.env.VERCEL_URL + placeRoute;
// Define Route for teams api
export const teamRouteServer = "http://" + process.env.VERCEL_URL + teamRoute;
// Define route for division api
export const divisionRouteServer =
	"http://" + process.env.VERCEL_URL + divisionRoute;
// Define route for mention api
export const mentionRouteServer =
	"http://" + process.env.VERCEL_URL + mentionRoute;
// Define route for paymentType api
export const paymentTypeRouteServer =
	"http://" + process.env.VERCEL_URL + paymentTypeRoute;
// Define route for payoutTier api
export const payoutTierRouteServer =
	"http://" + process.env.VERCEL_URL + payoutTierRoute;
// Define route for penalty api
export const penaltyRouteServer =
	"http://" + process.env.VERCEL_URL + penaltyRoute;
// Define route for peopleType api
export const peopleTypeRouteServer =
	"http://" + process.env.VERCEL_URL + peopleTypeRoute;
// Define route for placeType api
export const placeTypeRouteServer =
	"http://" + process.env.VERCEL_URL + placeTypeRoute;
// Define route for season api
export const seasonRouteServer =
	"http://" + process.env.VERCEL_URL + seasonRoute;
// Define route for trailsDate api
export const trailsDateRouteServer =
	"http://" + process.env.VERCEL_URL + trailsDateRoute;
// Define route for trails api
export const trailsRouteServer =
	"http://" + process.env.VERCEL_URL + trailsRoute;
// Define route for roster api
export const rosterRouteServer =
	"http://" + process.env.VERCEL_URL + rosterRoute;
// Define route for schedule api
export const scheduleRouteServer =
	"http://" + process.env.VERCEL_URL + scheduleRoute;
// Define route for weekly scoresheets api
export const weeklyScoresheetsRouteServer =
	"http://" + process.env.VERCEL_URL + weeklyScoresheetsRoute;
// Define route for payout api
export const payoutRouteServer =
	"http://" + process.env.VERCEL_URL + payoutRoute;
// Define route for trailsPlayerHistory api
export const trailsPlayerHistoryRouteServer =
	"http://" + process.env.VERCEL_URL + trailsPlayerHistoryRoute;
// Define route for mentionPlayerHistory api
export const mentionPlayerHistoryRouteServer =
	"http://" + process.env.VERCEL_URL + mentionPlayerHistoryRoute;
// Define route for playerPaymentHistory api
export const playerPaymentHistoryRouteServer =
	"http://" + process.env.VERCEL_URL + playerPaymentHistoryRoute;
// Define route for teamPaymentHistory api
export const teamPaymentHistoryRouteServer =
	"http://" + process.env.VERCEL_URL + teamPaymentHistoryRoute;
// Define route for placePaymentHistory api
export const placePaymentHistoryRouteServer =
	"http://" + process.env.VERCEL_URL + placePaymentHistoryRoute;
// Define route for user api
export const userRouteServer =
	"http://" + process.env.VERCEL_URL + userRoute;
