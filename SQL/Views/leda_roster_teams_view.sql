-- View: public.leda_roster_teams_view

-- DROP VIEW public.leda_roster_teams_view;

CREATE OR REPLACE VIEW public.leda_roster_teams_view
 AS
  SELECT DISTINCT leda_roster_info."seasonCode",
    teams.value ->> 'teamId'::text AS ledaid,
    ("left"(divs.division, 1) || regexp_replace(subs.subdivision, '[^0-9]'::text, ''::text, 'g'::text)) || teams.letter AS "divisionInfo"
   FROM leda_roster_info,
    LATERAL jsonb_each(leda_roster_info."teamInformation"::jsonb) divs(division, divdata),
    LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata),
    LATERAL jsonb_each(subs.subdata) teams(letter, value)
  WHERE teams.value ? 'teamId'::text;

ALTER TABLE public.leda_roster_teams_view
    OWNER TO admin;