//
// Local Routes
//

// Define Route for place owner api
export const placeOwnerRoute = '/api/management/player/placeOwner';
// Define route for players not on the serverside
export const playerRoute = '/api/management/player';
// Define route for places not on the serverside
export const placeRoute = '/api/management/place';
// Define route for teams not on the serverside
export const teamRoute = '/api/management/team';
// Define route for division not on the serverside
export const divisionRoute = '/api/management/division';
// Define route for mention not on the serverside
export const menttionRoute = '/api/management/mention';
// Define route for paymentType not on the serverside
export const paymentTypeRoute = '/api/management/paymentType';
// Define route for payoutTier not on the serverside
export const payoutTierRoute = '/api/management/payoutTier';
// Define route for penalty not on the serverside
export const penaltyRoute = '/api/management/penalty';
// Define route for peopleType not on the serverside
export const peopleTypeRoute = '/api/management/peopleType';
// Define route for placeType not on the serverside
export const placeTypeRoute = '/api/management/placeType';
// Define route for season not on the serverside
export const seasonRoute = '/api/management/season';
// Define route for seasonCode not on the serverside
export const seasonCodeRoute = '/api/management/season/seasonCode';

//
// Server Routes
//

// Define Route for players api
export const playerRouteServer = process.env.URL + playerRoute;
// Define Route for places api\
export const placeRouteServer = process.env.URL + placeRoute;
// Define Route for teams api
export const teamRouteServer = process.env.URL + teamRoute;
// Define route for division api
export const divisionRouteServer = process.env.URL + divisionRoute;
// Define route for mention api
export const mentionRouteServer = process.env.URL + menttionRoute;
// Define route for paymentType api
export const paymentTypeRouteServer = process.env.URL + paymentTypeRoute;
// Define route for payoutTier api
export const payoutTierRouteServer = process.env.URL + payoutTierRoute;
// Define route for penalty api
export const penaltyRouteServer = process.env.URL + penaltyRoute;
// Define route for peopleType api
export const peopleTypeRouteServer = process.env.URL + peopleTypeRoute;
// Define route for placeType api
export const placeTypeRouteServer = process.env.URL + placeTypeRoute;
// Define route for season api
export const seasonRouteServer = process.env.URL + seasonRoute;
