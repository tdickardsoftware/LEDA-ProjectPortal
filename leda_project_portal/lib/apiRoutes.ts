//
// Local Routes
//
// eslint-disable-next-line @typescript-eslint/no-require-imports
require ("dotenv").config(".env.preview.local");

// Define Route for place owner api
export const placeOwnerRoute = "/api/management/player/placeOwner";
// Define route for players not on the serverside
export const playerRoute = "/api/management/player";
// Define route for places not on the serverside
export const placeRoute = "/api/management/place";
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

//
// Server Routes
//

// Define Route for players api
export const playerRouteServer = "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL + playerRoute;
// Define Route for places api\
export const placeRouteServer = "https://" + process.env.VERCEL_URL + placeRoute;
// Define Route for teams api
export const teamRouteServer = "https://" + process.env.VERCEL_URL + teamRoute;
// Define route for division api
export const divisionRouteServer = "https://" + process.env.VERCEL_URL + divisionRoute;
// Define route for mention api
export const mentionRouteServer = "https://" + process.env.VERCEL_URL + mentionRoute;
// Define route for paymentType api
export const paymentTypeRouteServer = "https://" + process.env.VERCEL_URL + paymentTypeRoute;
// Define route for payoutTier api
export const payoutTierRouteServer = "https://" + process.env.VERCEL_URL + payoutTierRoute;
// Define route for penalty api
export const penaltyRouteServer = "https://" + process.env.VERCEL_URL + penaltyRoute;
// Define route for peopleType api
export const peopleTypeRouteServer = "https://" + process.env.VERCEL_URL + peopleTypeRoute;
// Define route for placeType api
export const placeTypeRouteServer = "https://" + process.env.VERCEL_URL + placeTypeRoute;
// Define route for season api
export const seasonRouteServer = "https://" + process.env.VERCEL_URL + seasonRoute;
