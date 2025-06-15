-- View: public.leda_reports_captains_mtg_team_report_team_place_info

-- DROP VIEW public.leda_reports_captains_mtg_team_report_team_place_info;

CREATE OR REPLACE VIEW public.leda_reports_captains_mtg_team_report_team_place_info
 AS
 WITH teams_flattened AS (
         SELECT (teams.team_info ->> 'teamId'::text)::integer AS team_id,
            (teams.team_info ->> 'placeId'::text)::integer AS place_id,
            teams.team_info ->> 'teamName'::text AS team_name,
            divisions.division_key AS division_name,
            subdivisions.subdivision_key AS subdivision_name,
            teams.team_key,
            lri."seasonCode"
           FROM leda_roster_info lri
             CROSS JOIN LATERAL json_each(lri."teamInfomation") divisions(division_key, division_value)
             CROSS JOIN LATERAL json_each(divisions.division_value -> 'subdivisions'::text) subdivisions(subdivision_key, subdivision_value)
             CROSS JOIN LATERAL json_each(subdivisions.subdivision_value) teams(team_key, team_info)
        ), clean_phone AS (
         SELECT leda_place_info."ledaId",
            leda_place_info.name,
            regexp_replace(leda_place_info."phoneNumber", '[^0-9]'::text, ''::text, 'g'::text) AS digits_only,
            leda_place_info."phoneNumber" AS original_phone
           FROM leda_place_info
        )
 SELECT tf.team_id AS "teamId",
    tf.team_name AS "teamName",
    tf.place_id AS "placeId",
    tf.division_name AS "divisionName",
    regexp_replace(tf.subdivision_name, '^Subdivision\s+'::text, ''::text, 'i'::text) AS "subdivisionNumber",
    cp.name AS "placeName",
        CASE
            WHEN length(cp.digits_only) = 10 THEN ((("substring"(cp.digits_only, 1, 3) || '-'::text) || "substring"(cp.digits_only, 4, 3)) || '-'::text) || "substring"(cp.digits_only, 7, 4)
            ELSE cp.original_phone
        END AS "phoneNumber",
    tf."seasonCode",
    tf.team_key AS "teamLetter",
    COALESCE(ltph."paidOff", false) AS "paidStatus",
    s."desc"
   FROM teams_flattened tf
     LEFT JOIN clean_phone cp ON tf.place_id = cp."ledaId"
     LEFT JOIN maint.leda_maint_team_payment_history ltph ON tf.team_id = ltph."ledaId" AND tf."seasonCode" = ltph."seasonCode" AND (ltph.type = ANY (ARRAY['Memb'::text, 'Part'::text]))
     LEFT JOIN maint.leda_maint_seasons s ON tf."seasonCode" = s."seasonCode";

ALTER TABLE public.leda_reports_captains_mtg_team_report_team_place_info
    OWNER TO admin;

