//
// Imports
//

import {Player, Team, Place, Division, Mention, PaymentType, PayoutTier, Penalty, PeopleType, PlaceType, Season } from './definitions'
import { divisionRouteServer, mentionRouteServer, paymentTypeRouteServer, payoutTierRouteServer, penaltyRouteServer, peopleTypeRouteServer, placeRouteServer, placeTypeRouteServer, playerRouteServer, seasonRouteServer, teamRouteServer } from './apiRoutes';
//
// async function to get all player data from the database
//
export async function fetchPlayers() {
    // attempt to get data
    try {
        const response = await fetch(playerRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as Player[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}

//
// async function to get all team data from the database
//
export async function fetchTeams() {
    // attempt to get data
    try {
        const response = await fetch(teamRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as Team[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all place data from the database
//
export async function fetchPlaces() {
    // attempt to get data
    try {
        const response = await fetch(placeRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as Place[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all division data from the database
//
export async function fetchDivisions() {
    // attempt to get data
    try {
        const response = await fetch(divisionRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as Division[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all Mention data from the database
//
export async function fetchMentions() {
    // attempt to get data
    try {
        const response = await fetch(mentionRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as Mention[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all Payment Type data from the database
//
export async function fetchPaymentTypes() {
    // attempt to get data
    try {
        const response = await fetch(paymentTypeRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as PaymentType[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all Payout Tiers data from the database
//
export async function fetchPayoutTiers() {
    // attempt to get data
    try {
        const response = await fetch(payoutTierRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as PayoutTier[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all Penalties data from the database
//
export async function fetchPenalties() {
    // attempt to get data
    try {
        const response = await fetch(penaltyRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as Penalty[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all People Types data from the database
//
export async function fetchPeopleTypes() {
    // attempt to get data
    try {
        const response = await fetch(peopleTypeRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as PeopleType[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all Place Types data from the database
//
export async function fetchPlaceTypes() {
    // attempt to get data
    try {
        const response = await fetch(placeTypeRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as PlaceType[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
//
// async function to get all Seasons data from the database
//
export async function fetchSeasons() {
    // attempt to get data
    try {
        const response = await fetch(seasonRouteServer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json() as Season[];
        return data;
    // if it cannot get data error out
    } catch (error) {
        console.error('API Error: ', error);
        throw new Error('Failed to fetch Player Information');
    }
}
