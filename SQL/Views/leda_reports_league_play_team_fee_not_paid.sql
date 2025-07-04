-- View: public.leda_reports_league_play_team_fee_not_paid

-- DROP VIEW public.leda_reports_league_play_team_fee_not_paid;

CREATE OR REPLACE VIEW public.leda_reports_league_play_team_fee_not_paid
 AS
 SELECT lrt."seasonCode",
    lrt."divisionInfo",
    lti."teamName",
    lpi.name
   FROM leda_roster_teams_view lrt
     LEFT JOIN leda_team_info lti ON lrt.ledaid = lti."ledaId"::text
     LEFT JOIN leda_place_info lpi ON lrt."placeId" = lpi."ledaId"::text
  WHERE NOT (EXISTS ( SELECT 1
           FROM maint.leda_maint_team_payment_history pph
          WHERE pph."ledaId"::text = lrt.ledaid AND pph."seasonCode" = lrt."seasonCode" AND (pph.type = ANY (ARRAY['Part'::text, 'Memb'::text])) AND pph."paidOff" = true));

ALTER TABLE public.leda_reports_league_play_team_fee_not_paid
    OWNER TO admin;

