import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/dbTypeGet'
import { Player } from '@/lib/definitions';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await query<Player>(`SELECT "ledaId", CONCAT(COALESCE("firstName", ''), ' ', COALESCE("middleInitial", ''), ' ', COALESCE("lastName", '')) as "fullName", "lastName", "firstName", "middleInitial", "addressOne", "addressTwo", city, state, zip, "phoneNumber", "otherNumber", email, gender, TO_CHAR("dateOfBirth", 'mm/dd/yyyy') as "dateOfBirth" FROM public.leda_player_info;`);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch genders' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}