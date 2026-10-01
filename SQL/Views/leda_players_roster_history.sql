-- View: public.leda_players_roster_history

-- DROP VIEW public.leda_players_roster_history;

CREATE OR REPLACE VIEW public.leda_players_roster_history
 AS
 WITH unique_teams AS NOT MATERIALIZED (
         SELECT t."teamId" AS team_leda_id,
            min(t."teamLetter"::text) AS team_letter,
            min(t."teamName") AS team_name,
            min(t.division) AS division,
            min(t.subdivision) AS subdivision,
            t."seasonCode"
           FROM leda_weekly_scoresheets_team_info t
          GROUP BY t."teamId", t."seasonCode"
        ), latest_player_weeks AS NOT MATERIALIZED (
         SELECT DISTINCT ON (leda_weekly_scoresheets_player_info."seasonCode", leda_weekly_scoresheets_player_info."ledaId", leda_weekly_scoresheets_player_info."teamId") leda_weekly_scoresheets_player_info."seasonCode",
            leda_weekly_scoresheets_player_info."ledaId",
            leda_weekly_scoresheets_player_info."teamId",
            leda_weekly_scoresheets_player_info."weekNum"
           FROM leda_weekly_scoresheets_player_info
          ORDER BY leda_weekly_scoresheets_player_info."seasonCode", leda_weekly_scoresheets_player_info."ledaId", leda_weekly_scoresheets_player_info."teamId", leda_weekly_scoresheets_player_info."weekNum" DESC
        ), unique_player_points AS NOT MATERIALIZED (
         SELECT leda_weekly_player_points."seasonCode",
            leda_weekly_player_points."ledaId",
            leda_weekly_player_points."teamLedaId",
            max(leda_weekly_player_points."totalPoints") AS "totalPoints"
           FROM leda_weekly_player_points
          GROUP BY leda_weekly_player_points."seasonCode", leda_weekly_player_points."ledaId", leda_weekly_player_points."teamLedaId"
        ), unique_payouts AS NOT MATERIALIZED (
         SELECT DISTINCT leda_payouts."seasonCode",
            leda_payouts."payoutsData"
           FROM leda_payouts
        )
 SELECT p."ledaId" AS player_id,
    ut.team_leda_id AS team_id,
    ut.team_letter,
    ut.team_name,
    ut.division,
    ut.subdivision,
    p."seasonCode",
    pp."totalPoints",
    COALESCE(((((lp."payoutsData" -> ut.division) -> ut.subdivision) -> ut.team_leda_id::text) ->> 'place'::text)::integer, 0) AS place
   FROM latest_player_weeks p
     JOIN unique_teams ut ON p."seasonCode" = ut."seasonCode" AND p."teamId" = ut.team_leda_id
     LEFT JOIN unique_player_points pp ON p."seasonCode" = pp."seasonCode" AND p."ledaId" = pp."ledaId" AND p."teamId" = pp."teamLedaId"
     LEFT JOIN unique_payouts lp ON lp."seasonCode" = ut."seasonCode";

ALTER TABLE public.leda_players_roster_history
    OWNER TO admin;

