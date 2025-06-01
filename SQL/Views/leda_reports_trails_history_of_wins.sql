-- View: public.leda_reports_trails_history_of_wins

-- DROP VIEW public.leda_reports_trails_history_of_wins;

CREATE OR REPLACE VIEW public.leda_reports_trails_history_of_wins
 AS
 SELECT p."ledaId",
    concat(COALESCE(p."firstName", ''::text), ' ', COALESCE(p."middleInitial", ''::character varying), ' ', COALESCE(p."lastName", ''::text)) AS "fullName",
    count(
        CASE
            WHEN t."singlesPlace" = 1 THEN 1
            ELSE NULL::integer
        END) AS "singlesPlace1",
    count(
        CASE
            WHEN t."singlesPlace" = 2 THEN 1
            ELSE NULL::integer
        END) AS "singlesPlace2",
    count(
        CASE
            WHEN t."singlesPlace" = 3 THEN 1
            ELSE NULL::integer
        END) AS "singlesPlace3",
    count(
        CASE
            WHEN t."singlesPlace" = 4 THEN 1
            ELSE NULL::integer
        END) AS "singlesPlace4",
    count(
        CASE
            WHEN t."doublesPlace" = 1 THEN 1
            ELSE NULL::integer
        END) AS "doublesPlace1",
    count(
        CASE
            WHEN t."doublesPlace" = 2 THEN 1
            ELSE NULL::integer
        END) AS "doublesPlace2",
    count(
        CASE
            WHEN t."doublesPlace" = 3 THEN 1
            ELSE NULL::integer
        END) AS "doublesPlace3",
    count(
        CASE
            WHEN t."doublesPlace" = 4 THEN 1
            ELSE NULL::integer
        END) AS "doublesPlace4"
   FROM leda_trails_point_totals_audit t
     JOIN leda_player_info p ON t."ledaId" = p."ledaId"
  GROUP BY p."ledaId", p."firstName", p."middleInitial", p."lastName"
  ORDER BY p."ledaId";

ALTER TABLE public.leda_reports_trails_history_of_wins
    OWNER TO admin;

