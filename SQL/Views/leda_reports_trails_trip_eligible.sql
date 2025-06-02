-- View: public.leda_reports_trails_trip_eligible

-- DROP VIEW public.leda_reports_trails_trip_eligible;

CREATE OR REPLACE VIEW public.leda_reports_trails_trip_eligible
 AS
 SELECT p."ledaId",
    concat(COALESCE(p."firstName", ''::text), ' ', COALESCE(p."middleInitial", ''::character varying), ' ', COALESCE(p."lastName", ''::text)) AS "fullName",
    concat(COALESCE(p."addressOne", ''::text), ' ', COALESCE(p."addressTwo", ''::text), ' ', COALESCE(p.city, ''::text), ', ', COALESCE(p.state, ''::text), ' ', COALESCE(p.zip, ''::character varying)) AS "addressFull",
    max(t."totalPoints") AS totalpoints
   FROM leda_trails_point_totals_audit t
     JOIN leda_player_info p ON t."ledaId" = p."ledaId"
  WHERE t."totalPoints" > 500
  GROUP BY p."ledaId", p."firstName", p."middleInitial", p."lastName", p."addressOne", p."addressTwo", p.city, p.state, p.zip
  ORDER BY (max(t."totalPoints")) DESC;

ALTER TABLE public.leda_reports_trails_trip_eligible
    OWNER TO admin;