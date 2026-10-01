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
        CASE
            WHEN pi."ledaId" IS NULL OR lpi."contactId" = 0 THEN 'UNKNOWN'::text
            ELSE concat(COALESCE(pi."lastName", ''::text), ', ', COALESCE(pi."firstName", ''::text), ' ', COALESCE(pi."middleInitial", ''::character varying))
        END AS contact,
    lpi."establishDate",
    lpi.issues AS "badStanding"
   FROM leda_roster_places_view rpv
     JOIN leda_place_info lpi ON rpv.ledaid::bigint = lpi."ledaId"
     LEFT JOIN leda_player_info pi ON lpi."contactId" = pi."ledaId";

ALTER TABLE public.leda_reports_lists_places_list
    OWNER TO admin;

