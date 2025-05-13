-- View: public.leda_roster_teams_view

-- DROP VIEW public.leda_roster_teams_view;

CREATE OR REPLACE VIEW public.leda_roster_teams_view
 AS
 SELECT DISTINCT leda_roster_info."seasonCode",
    teams.value ->> 'teamId'::text AS ledaid
   FROM leda_roster_info,
    LATERAL jsonb_each(leda_roster_info."teamInfomation"::jsonb) divs(division, divdata),
    LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata),
    LATERAL jsonb_each(subs.subdata) teams(letter, value)
  WHERE teams.value ? 'teamId'::text;

ALTER TABLE public.leda_roster_teams_view
    OWNER TO admin;