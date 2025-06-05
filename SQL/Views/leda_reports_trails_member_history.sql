-- View: public.leda_reports_trails_member_history

-- DROP VIEW public.leda_reports_trails_member_history;

CREATE OR REPLACE VIEW public.leda_reports_trails_member_history
 AS
 SELECT DISTINCT p."ledaId",
    concat(COALESCE(p."firstName", ''::text), ' ', COALESCE(p."middleInitial", ''::character varying), ' ', COALESCE(p."lastName", ''::text)) AS "fullName"
   FROM leda_membership_info m
     JOIN leda_player_info p ON m."ledaId" = p."ledaId"
  WHERE m."lastTrailsDate" IS NOT NULL;

ALTER TABLE public.leda_reports_trails_member_history
    OWNER TO admin;