-- View: public.leda_reports_league_play_team_fee_not_paid

-- DROP VIEW public.leda_reports_league_play_team_fee_not_paid;

CREATE OR REPLACE VIEW public.leda_reports_league_play_team_fee_not_paid
 AS
 SELECT spcs."seasonCode",
    ("left"(divs.division, 1) || regexp_replace(subs.subdivision, '[^0-9]'::text, ''::text, 'g'::text)) || teams.letter AS "divisionInfo",
    lti."teamName",
    lpi.name
   FROM leda_reports_captains_mtg_schedules_place_captain_season_info spcs
     JOIN leda_team_info lti ON spcs."teamId"::bigint = lti."ledaId"
     JOIN leda_roster_info lri ON lri."seasonCode" = spcs."seasonCode"
     JOIN LATERAL jsonb_each(lri."teamInformation") divs(division, divdata) ON true
     JOIN LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata) ON true
     JOIN LATERAL jsonb_each(subs.subdata) teams(letter, value) ON true
     LEFT JOIN leda_place_info lpi ON (teams.value ->> 'placeId'::text) = lpi."ledaId"::text
  WHERE ((teams.value ->> 'teamId'::text)::bigint) = spcs."teamId"::bigint AND divs.division = spcs.division AND subs.subdivision = spcs.subdivision AND NOT (EXISTS ( SELECT 1
           FROM maint.leda_maint_team_payment_history pph
          WHERE pph."ledaId"::text = spcs."teamId" AND pph."seasonCode" = spcs."seasonCode" AND (pph.type = ANY (ARRAY['Part'::text, 'Memb'::text])) AND pph."paidOff" = true));

ALTER TABLE public.leda_reports_league_play_team_fee_not_paid
    OWNER TO admin;

