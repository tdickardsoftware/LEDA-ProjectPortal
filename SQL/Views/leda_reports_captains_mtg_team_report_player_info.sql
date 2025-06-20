-- View: public.leda_reports_captains_mtg_team_report_player_info

-- DROP VIEW public.leda_reports_captains_mtg_team_report_player_info;

CREATE OR REPLACE VIEW public.leda_reports_captains_mtg_team_report_player_info
 AS
 WITH team_ids AS (
         SELECT DISTINCT (teams.team_info ->> 'teamId'::text)::integer AS team_id
           FROM leda_roster_info lri
             CROSS JOIN LATERAL json_each(lri."teamInformation") divisions(division_key, division_value)
             CROSS JOIN LATERAL json_each(divisions.division_value -> 'subdivisions'::text) subdivisions(subdivision_key, subdivision_value)
             CROSS JOIN LATERAL json_each(subdivisions.subdivision_value) teams(team_key, team_info)
        ), team_members AS (
         SELECT ti.team_id,
            (member_data.value ->> 'ledaId'::text)::integer AS player_id,
            (member_data.value ->> 'isCaptain'::text)::boolean AS is_captain
           FROM team_ids ti
             JOIN leda_team_info lti ON ti.team_id = lti."ledaId"
             CROSS JOIN LATERAL json_each(lti."memberIdList") member_data(member_key, value)
        ), player_data AS (
         SELECT p."ledaId",
            p."lastName",
            p."firstName",
            p."middleInitial",
            regexp_replace(p."phoneNumber", '[^0-9]'::text, ''::text, 'g'::text) AS digits_only,
            p."phoneNumber" AS original_phone,
            COALESCE(m."formOnFile", false) AS form_on_file
           FROM leda_player_info p
             LEFT JOIN leda_membership_info m ON p."ledaId" = m."ledaId"
        ), latest_payment AS (
         SELECT DISTINCT ON (lph."ledaId") lph."ledaId",
            to_char(lph.date::timestamp with time zone, 'MM/DD/YYYY'::text) AS formatted_date
           FROM maint.leda_maint_player_payment_history lph
          WHERE (lph.type = ANY (ARRAY['Memb'::text, 'Part'::text])) AND lph."paidOff" = true
          ORDER BY lph."ledaId", lph.date DESC
        )
 SELECT tm.team_id AS "teamId",
    tm.player_id AS "playerId",
        CASE
            WHEN tm.is_captain THEN 'CAPT'::text
            ELSE ''::text
        END AS "isCaptain",
        CASE
            WHEN pd."lastName" IS NOT NULL OR pd."firstName" IS NOT NULL THEN TRIM(BOTH FROM concat(COALESCE(pd."lastName", ''::text), ', ', COALESCE(pd."firstName", ''::text),
            CASE
                WHEN pd."middleInitial" IS NOT NULL AND pd."middleInitial"::text <> ''::text THEN ' '::text || pd."middleInitial"::text
                ELSE ''::text
            END))
            ELSE ''::text
        END AS "fullName",
        CASE
            WHEN length(pd.digits_only) = 10 THEN ((("substring"(pd.digits_only, 1, 3) || '-'::text) || "substring"(pd.digits_only, 4, 3)) || '-'::text) || "substring"(pd.digits_only, 7, 4)
            ELSE pd.original_phone
        END AS "phoneNumber",
        CASE
            WHEN pd.form_on_file THEN 'No'::text
            ELSE 'Yes'::text
        END AS "needForm",
    COALESCE(lp.formatted_date, 'N/A'::text) AS "datesDuesPaid"
   FROM team_members tm
     LEFT JOIN player_data pd ON tm.player_id = pd."ledaId"
     LEFT JOIN latest_payment lp ON tm.player_id = lp."ledaId";

ALTER TABLE public.leda_reports_captains_mtg_team_report_player_info
    OWNER TO admin;

