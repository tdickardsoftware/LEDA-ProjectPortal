-- View: public.leda_roster_places_view

-- DROP VIEW public.leda_roster_places_view;

CREATE OR REPLACE VIEW public.leda_roster_places_view
 AS
 SELECT DISTINCT leda_roster_info."seasonCode",
    teams.value ->> 'placeId'::text AS ledaid
   FROM leda_roster_info,
    LATERAL jsonb_each(leda_roster_info."teamInfomation"::jsonb) divs(division, divdata),
    LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata),
    LATERAL jsonb_each(subs.subdata) teams(letter, value)
  WHERE teams.value ? 'placeId'::text;

ALTER TABLE public.leda_roster_places_view
    OWNER TO admin;
