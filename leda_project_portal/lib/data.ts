import { sql } from '@vercel/postgres';
import {Player, } from './definitions'

export async function fetchPlayers() {
    try {
        const data = await sql<Player>`SELECT * from public.leda_player_info`;
        return data.rows;
    } catch(error) {
        console.error('Database Error: ', error)
        throw new Error('Failed to fetch Player Information')
    }
}