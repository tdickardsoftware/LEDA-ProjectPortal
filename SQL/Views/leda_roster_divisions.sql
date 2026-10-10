-- View: public.leda_roster_divisions

-- DROP VIEW public.leda_roster_divisions;

CREATE OR REPLACE VIEW public.leda_roster_divisions
 AS
 SELECT DISTINCT r."seasonCode",
    divs.division
   FROM leda_roster_info r
     CROSS JOIN LATERAL jsonb_object_keys(r."teamInformation") divs(division);

ALTER TABLE public.leda_roster_divisions
    OWNER TO admin;

