//
// Imports
//
import {Player, } from './definitions'
import { query } from './db';
//
// async function to get all player data from the database
//
export async function fetchPlayers() {
    // attempt to get data
    try {
        const data = await query<Player>(`SELECT "ledaId", CONCAT(COALESCE("firstName", ''), ' ', COALESCE("middleInitial", ''), ' ', COALESCE("lastName", '')) as "fullName", "lastName", "firstName", "middleInitial", "addressOne", "addressTwo", city, state, zip, "phoneNumber", "otherNumber", email, gender, "dateOfBirth" FROM public.leda_player_info;`);
        return data.rows;
    // if it cannot get data error out
    } catch(error) {
        console.error('Database Error: ', error)
        throw new Error('Failed to fetch Player Information')
    }
}