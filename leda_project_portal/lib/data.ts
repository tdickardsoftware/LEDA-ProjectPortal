//
// Imports
//
import { sql } from '@vercel/postgres';
import {Player, } from './definitions'
//
// async function to get all player data from the database
//
export async function fetchPlayers() {
    // attempt to get data
    try {
        const data = await sql<Player>`SELECT * from public.leda_player_info`;
        return data.rows;
    // if it cannot get data error out
    } catch(error) {
        console.error('Database Error: ', error)
        throw new Error('Failed to fetch Player Information')
    }
}