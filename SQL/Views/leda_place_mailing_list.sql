-- View: public.leda_place_mailing_list

-- DROP VIEW public.leda_place_mailing_list;

CREATE OR REPLACE VIEW public.leda_place_mailing_list
 AS
 SELECT "ledaId",
    name,
    concat(COALESCE("addressOne", ''::text), ' ', COALESCE("addressTwo", ''::text)) AS "addressLineOne",
    concat(COALESCE(city, ''::text), ', ', COALESCE(state, ''::text), ' ', COALESCE(zip, ''::text::character varying)) AS "addressLineTwo",
    'PLACE'::text AS type
   FROM leda_place_info lp
  WHERE "sendMailings" = true;

ALTER TABLE public.leda_place_mailing_list
    OWNER TO admin;

