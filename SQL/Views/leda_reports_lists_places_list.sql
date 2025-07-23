-- View: public.leda_reports_lists_places_list

-- DROP VIEW public.leda_reports_lists_places_list;

CREATE OR REPLACE VIEW public.leda_reports_lists_places_list
 AS
 SELECT rpv."seasonCode",
    rpv.ledaid AS "ledaId",
    lpi.name,
    lpi.email,
    lpi."addressOne",
    lpi."addressTwo",
    lpi.city,
    lpi.state,
    lpi.zip,
    concat(SUBSTRING(lpi."phoneNumber" FROM 1 FOR 3), '-', SUBSTRING(lpi."phoneNumber" FROM 4 FOR 3), '-', SUBSTRING(lpi."phoneNumber" FROM 7 FOR 4)) AS "phoneNumber",
    concat(COALESCE(pi."lastName", ''::text), ', ', COALESCE(pi."firstName", ''::text), ' ', COALESCE(pi."middleInitial", ''::character varying)) AS contact
   FROM leda_roster_places_view rpv
     JOIN leda_place_info lpi ON rpv.ledaid::bigint = lpi."ledaId"
     JOIN leda_player_info pi ON lpi."contactId" = pi."ledaId";

ALTER TABLE public.leda_reports_lists_places_list
    OWNER TO admin;

