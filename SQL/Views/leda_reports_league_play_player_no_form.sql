-- View: public.leda_reports_league_play_player_no_form

-- DROP VIEW public.leda_reports_league_play_player_no_form;

CREATE OR REPLACE VIEW public.leda_reports_league_play_player_no_form
 AS
 SELECT rpv."seasonCode",
    rpv.ledaid AS "ledaId",
    lmi."formOnFile",
    concat_ws(' '::text, NULLIF(lpi."firstName", ''::text), NULLIF(lpi."middleInitial"::text, ''::text), NULLIF(lpi."lastName", ''::text)) AS "fullName"
   FROM leda_roster_players_view rpv
     LEFT JOIN leda_player_info lpi ON rpv.ledaid = lpi."ledaId"::text
     JOIN leda_membership_info lmi ON rpv.ledaid = lmi."ledaId"::text
  WHERE lmi."formOnFile" = false;

ALTER TABLE public.leda_reports_league_play_player_no_form
    OWNER TO admin;

