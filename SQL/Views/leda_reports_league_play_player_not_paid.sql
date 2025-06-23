-- View: public.leda_reports_league_play_player_not_paid

-- DROP VIEW public.leda_reports_league_play_player_not_paid;

CREATE OR REPLACE VIEW public.leda_reports_league_play_player_not_paid
 AS
 SELECT rpv."seasonCode",
    rpv.ledaid AS "ledaId",
    concat_ws(' '::text, NULLIF(lpi."firstName", ''::text), NULLIF(lpi."middleInitial"::text, ''::text), NULLIF(lpi."lastName", ''::text)) AS "fullName"
   FROM leda_roster_players_view rpv
     LEFT JOIN leda_player_info lpi ON rpv.ledaid = lpi."ledaId"::text
  WHERE NOT (EXISTS ( SELECT 1
           FROM maint.leda_maint_player_payment_history pph
          WHERE pph."ledaId"::text = rpv.ledaid AND pph."seasonCode" = rpv."seasonCode" AND pph."paidOff" = true AND (pph.type = ANY (ARRAY['Part'::text, 'Memb'::text]))));

ALTER TABLE public.leda_reports_league_play_player_not_paid
    OWNER TO admin;

