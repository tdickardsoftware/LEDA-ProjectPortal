//
// Imports
//
import {Player, Team, Place, Division, Mention, PaymentType, PayoutTier, Penalty, PeopleType, PlaceType, Season } from './definitions'
import { query } from './db';
//
// async function to get all player data from the database
//
export async function fetchPlayers() {
    // attempt to get data
    try {
        const data = await query<Player>(`SELECT "ledaId", CONCAT(COALESCE("firstName", ''), ' ', COALESCE("middleInitial", ''), ' ', COALESCE("lastName", '')) as "fullName", "lastName", "firstName", "middleInitial", "addressOne", "addressTwo", city, state, zip, "phoneNumber", "otherNumber", email, gender, TO_CHAR("dateOfBirth", 'mm/dd/yyyy') as "dateOfBirth" FROM public.leda_player_info;`);
        return data.rows;
    // if it cannot get data error out
    } catch(error) {
        console.error('Database Error: ', error)
        throw new Error('Failed to fetch Player Information')
    }
}
//
// async function to get all team data from the database
//
export async function fetchTeams() {
    // attempt to get data
    try {
        const data = await query<Team>(`SELECT "ledaId", "teamName", TO_CHAR("establishedDate", 'mm/dd/YYYY') as "establishedDate", "memo", "lastTeamFeePayment" FROM public.leda_team_info;`);
        return data.rows
    } catch (error) {
        console.error('Database Error: ', error)
        throw new Error('Failed to fetch Team Information')
    }
}
//
// async function to get all place data from the database
//
export async function fetchPlaces() {
    try {
        const data = await query<Place>(`SELECT "ledaId", "name", CONCAT(COALESCE("addressOne", ''), ' ', COALESCE("addressTwo", ''), ', ', COALESCE("city", ''), ' ', COALESCE("state", ''), ', ', COALESCE("zip", '')) as "addressFull", "addressOne", "addressTwo", "city", "state", "zip", "phoneNumber", "otherNumber", "email", "website", "establishDate", "memo", "numberOfBoards", "sendMailings", "regularSponsor", "currentSponsor", "issues", "lastBarFeePayment", "lastSanctioningDate", "contactId", "placeType" FROM public.leda_place_info;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
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
    try {
        const data = await query<Season>(`SELECT "seasonCode", "desc", "fiscalYear", "dates", "isCurrentSeason" FROM maint.leda_maint_seasons;`);
        return data.rows
    } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch Place Information')
    }
}