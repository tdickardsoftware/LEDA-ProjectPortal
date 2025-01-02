//
// Imports
//

import {Player, Team, Place, Division, Mention, PaymentType, PayoutTier, Penalty, PeopleType, PlaceType, Season } from './definitions'
import { query } from './dbTypeGet';
import { placeRouteServer, playerRouteServer, seasonRouteServer, teamRouteServer } from './apiRoutes';
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
    try {
        const data = await query<Division>(`SELECT "divisionName" FROM maint.leda_maint_divisions;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
    }
}
//
// async function to get all Mention data from the database
//
export async function fetchMentions() {
    try {
        const data = await query<Mention>(`SELECT "mentionCode", "desc", "points", "mentionBasis" FROM maint.leda_maint_mentions;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
    }
}
//
// async function to get all Payment Type data from the database
//
export async function fetchPaymentTypes() {
    try {
        const data = await query<PaymentType>(`SELECT "paymentType", "desc" FROM maint.leda_maint_payment_types;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
    }
}
//
// async function to get all Payout Tiers data from the database
//
export async function fetchPayoutTiers() {
    try {
        const data = await query<PayoutTier>(`SELECT "place", "amount" FROM maint.leda_maint_payout_tiers;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
    }
}
//
// async function to get all Penalties data from the database
//
export async function fetchPenalties() {
    try {
        const data = await query<Penalty>(`SELECT "penaltyCode", "desc" FROM maint.leda_maint_penalties;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
    }
}
//
// async function to get all People Types data from the database
//
export async function fetchPeopleTypes() {
    try {
        const data = await query<PeopleType>(`SELECT "peopleTypeCode", "desc" FROM maint.leda_maint_people_types;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
    }
}
//
// async function to get all Place Types data from the database
//
export async function fetchPlaceTypes() {
    try {
        const data = await query<PlaceType>(`SELECT "placeTypeCode", "desc" FROM maint.leda_maint_place_types;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
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
