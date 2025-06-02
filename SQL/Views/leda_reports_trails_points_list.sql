-- View: public.leda_reports_trails_points_list

-- DROP VIEW public.leda_reports_trails_points_list;

CREATE OR REPLACE VIEW public.leda_reports_trails_points_list
 AS
 WITH current_season AS (
         SELECT leda_maint_seasons."seasonCode"
           FROM maint.leda_maint_seasons
          WHERE leda_maint_seasons."isCurrentSeason" = true
         LIMIT 1
        ), player_payments AS (
         SELECT DISTINCT ph."ledaId",
                CASE
                    WHEN count(*) > 0 THEN true
                    ELSE false
                END AS "paidDues"
           FROM maint.leda_maint_player_payment_history ph
             CROSS JOIN current_season cs
          WHERE ph."seasonCode" = cs."seasonCode" AND (ph.type = ANY (ARRAY['Memb'::text, 'Part'::text]))
          GROUP BY ph."ledaId"
        ), ranked_records AS (
         SELECT t."ledaId",
            t."modifyDate",
            t."previousTotalPoints",
            t."totalPoints",
            t."changeBy",
            t."trailsDate",
            t."singlesPlace",
            t."doublesPlace",
            row_number() OVER (PARTITION BY t."ledaId" ORDER BY t."trailsDate" DESC, t."modifyDate" DESC) AS rn
           FROM leda_trails_point_totals_audit t
          WHERE t."totalPoints" > 0
        )
 SELECT r."ledaId",
    r."modifyDate",
    r."previousTotalPoints",
    r."totalPoints",
    r."changeBy",
    r."trailsDate",
    r."singlesPlace",
    r."doublesPlace",
    concat(p."lastName", ', ', p."firstName", ' ', COALESCE(p."middleInitial", ''::character varying)) AS fullname,
    COALESCE(pp."paidDues", false) AS "paidDues"
   FROM ranked_records r
     LEFT JOIN leda_player_info p ON r."ledaId" = p."ledaId"
     LEFT JOIN player_payments pp ON r."ledaId" = pp."ledaId"
  WHERE r.rn = 1
  ORDER BY r."ledaId";

ALTER TABLE public.leda_reports_trails_points_list
    OWNER TO admin;