-- View: public.leda_reports_lists_team_list

-- DROP VIEW public.leda_reports_lists_team_list;

CREATE OR REPLACE VIEW public.leda_reports_lists_team_list
 AS
 SELECT spcs."seasonCode",
    spcs."desc",
    spcs."teamId",
    lti."teamName",
    spcs.division,
    ("left"(divs.division, 1) || regexp_replace(subs.subdivision, '[^0-9]'::text, ''::text, 'g'::text)) || teams.letter AS "divisionInfo",
    spcs."placeName",
    spcs."addressFirstLine",
    spcs."addressSecondLine",
    spcs."placePhoneNumber",
    spcs."captainFullName",
    spcs."captainPhoneNumber",
    lti."establishedDate",
    regexp_replace(subs.subdivision, '[^0-9]'::text, ''::text, 'g'::text) AS subdivision
   FROM leda_reports_captains_mtg_schedules_place_captain_season_info spcs
     JOIN leda_team_info lti ON spcs."teamId"::bigint = lti."ledaId"
     JOIN leda_roster_info lri ON lri."seasonCode" = spcs."seasonCode"
     JOIN LATERAL jsonb_each(lri."teamInformation") divs(division, divdata) ON true
     JOIN LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata) ON true
     JOIN LATERAL jsonb_each(subs.subdata) teams(letter, value) ON true
  WHERE ((teams.value ->> 'teamId'::text)::bigint) = spcs."teamId"::bigint AND divs.division = spcs.division AND subs.subdivision = spcs.subdivision;

ALTER TABLE public.leda_reports_lists_team_list
    OWNER TO admin;

