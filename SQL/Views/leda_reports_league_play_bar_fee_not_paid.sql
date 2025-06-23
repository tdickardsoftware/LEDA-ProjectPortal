-- View: public.leda_reports_league_play_bar_fee_not_paid

-- DROP VIEW public.leda_reports_league_play_bar_fee_not_paid;

CREATE OR REPLACE VIEW public.leda_reports_league_play_bar_fee_not_paid
 AS
 SELECT rpv."seasonCode",
    rpv.ledaid,
    lpi.name
   FROM leda_roster_places_view rpv
     LEFT JOIN leda_place_info lpi ON rpv.ledaid = lpi."ledaId"::text
  WHERE NOT (EXISTS ( SELECT 1
           FROM maint.leda_maint_place_payment_history pph
          WHERE pph."ledaId"::text = rpv.ledaid AND pph."seasonCode" = rpv."seasonCode" AND (pph.type = ANY (ARRAY['Bar'::text, 'Part'::text])) AND pph."paidOff" = true));

ALTER TABLE public.leda_reports_league_play_bar_fee_not_paid
    OWNER TO admin;

