-- View: public.leda_players_roster_history

-- DROP VIEW public.leda_players_roster_history;

CREATE OR REPLACE VIEW public.leda_players_roster_history
 AS
 WITH unique_teams AS (
         SELECT DISTINCT teams.team_id::bigint AS team_leda_id,
            teams.team_data ->> 'teamLetter'::text AS team_letter,
            teams.team_data ->> 'teamName'::text AS team_name,
            divisions.division_key AS division,
            subdivisions.subdivision_key AS subdivision,
            lws."seasonCode"
           FROM leda_weekly_scoresheets lws,
            LATERAL jsonb_each(lws."scoresheetData"::jsonb) divisions(division_key, division_value),
            LATERAL jsonb_each(divisions.division_value) subdivisions(subdivision_key, subdivision_value),
            LATERAL jsonb_each(subdivisions.subdivision_value) matchups(matchup_key, matchup_value),
            LATERAL jsonb_each(matchups.matchup_value -> 'teamInformation'::text) teams(team_id, team_data)
          WHERE (teams.team_data -> 'teamMembers'::text) ? '1'::text
        )
 SELECT pp."ledaId" AS player_id,
    ut.team_leda_id AS team_id,
    ut.team_letter,
    ut.team_name,
    ut.division,
    ut.subdivision,
    ut."seasonCode",
    pp."totalPoints",
    COALESCE(((((lp."payoutsData" -> ut.division) -> ut.subdivision) -> ut.team_leda_id::text) ->> 'place'::text)::integer, 0) AS place
   FROM leda_weekly_player_points pp
     JOIN unique_teams ut ON pp."teamLedaId" = ut.team_leda_id AND pp."seasonCode" = ut."seasonCode"
     LEFT JOIN leda_payouts lp ON lp."seasonCode" = ut."seasonCode"
  WHERE pp."weekNum" = (( SELECT max(pp2."weekNum") AS max
           FROM leda_weekly_player_points pp2
          WHERE pp2."ledaId" = pp."ledaId" AND pp2."teamLedaId" = pp."teamLedaId" AND pp2."seasonCode" = pp."seasonCode"));

ALTER TABLE public.leda_players_roster_history
    OWNER TO admin;