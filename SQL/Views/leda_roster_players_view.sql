-- View: public.leda_roster_players_view

-- DROP VIEW public.leda_roster_players_view;

CREATE OR REPLACE VIEW public.leda_roster_players_view
 AS
 SELECT DISTINCT r."seasonCode",
    player.playervalue ->> 'ledaId'::text AS ledaid
   FROM leda_roster_info r,
    LATERAL jsonb_each(r."teamInfomation"::jsonb) divs(division, divdata),
    LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata),
    LATERAL jsonb_each(subs.subdata) teams(letter, value)
     JOIN leda_team_info t ON t."ledaId" = ((teams.value ->> 'teamId'::text)::bigint),
    LATERAL jsonb_each(t."memberIdList"::jsonb) player(playerkey, playervalue)
  WHERE teams.value ? 'teamId'::text AND player.playervalue ? 'ledaId'::text;

ALTER TABLE public.leda_roster_players_view
    OWNER TO admin;