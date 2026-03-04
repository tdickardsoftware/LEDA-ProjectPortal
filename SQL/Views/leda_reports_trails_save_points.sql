-- View: public.leda_reports_trails_save_points

-- DROP VIEW public.leda_reports_trails_save_points;

CREATE OR REPLACE VIEW public.leda_reports_trails_save_points
 AS
 SELECT DISTINCT p."ledaId",
    concat(COALESCE(p."lastName", ''::text), ', ', COALESCE(p."firstName", ''::character varying::text), ' ', COALESCE(p."middleInitial", ''::text::character varying)) AS "fullName",
    concat(COALESCE(p."addressOne", ''::text), ' ', COALESCE(p."addressTwo", ''::text)) AS "addressFirstLine",
    concat(COALESCE(p.city, ''::text), ', ', COALESCE(p.state, ''::text), ' ', COALESCE(p.zip, ''::text::character varying)) AS "addressSecondLine",
    m."lastTrailsDate",
    max(t."totalPoints") AS totalpoints
   FROM leda_membership_info m
     JOIN leda_player_info p ON m."ledaId" = p."ledaId"
     JOIN leda_trails_point_totals_audit t ON m."ledaId" = t."ledaId"
  WHERE m."lastTrailsDate" < (CURRENT_DATE - '4 mons'::interval)
  GROUP BY p."ledaId", p."firstName", p."middleInitial", p."lastName", m."lastTrailsDate", p."addressOne", p."addressTwo", p.city, p.state, p.zip;

ALTER TABLE public.leda_reports_trails_save_points
    OWNER TO admin;