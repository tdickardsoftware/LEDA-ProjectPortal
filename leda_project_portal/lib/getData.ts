//
// Imports
//
import {Player, Team, Place, Division, Mention, } from './definitions'
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
// async function to get all division data from the database
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