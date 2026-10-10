-- View: public.leda_player_mailing_list

-- DROP VIEW public.leda_player_mailing_list;

CREATE OR REPLACE VIEW public.leda_player_mailing_list
 AS
 SELECT lp."ledaId",
    lp."fullName" AS name,
    concat(COALESCE(lp."addressOne", ''::text), ' ', COALESCE(lp."addressTwo", ''::text)) AS "addressLineOne",
    concat(COALESCE(lp.city, ''::text), ', ', COALESCE(lp.state, ''::text), ' ', COALESCE(lp.zip, ''::text::character varying)) AS "addressLineTwo",
    'PLAYER'::text AS type
   FROM leda_player_info lp
     JOIN leda_membership_info lm ON lp."ledaId" = lm."ledaId"
  WHERE lm."takeOffMailing" = false;

ALTER TABLE public.leda_player_mailing_list
    OWNER TO admin;

