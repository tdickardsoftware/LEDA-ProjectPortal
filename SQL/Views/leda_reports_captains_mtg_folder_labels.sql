-- View: public.leda_reports_captains_mtg_folder_labels

-- DROP VIEW public.leda_reports_captains_mtg_folder_labels;

CREATE OR REPLACE VIEW public.leda_reports_captains_mtg_folder_labels
 AS
 SELECT (teams_final.team_info ->> 'teamId'::text)::integer AS "teamId",
    teams_final.team_info ->> 'teamName'::text AS "teamName",
    (teams_final.team_info ->> 'placeId'::text)::integer AS "placeId",
    "left"(teams_final.division_name, 1) AS "divisionLetter",
    regexp_replace(teams_final.subdivision_name, '^Subdivision\s+'::text, ''::text, 'i'::text) AS "subdivisionNumber",
    lpi.name AS "placeName",
    COALESCE((captain_info.value ->> 'ledaId'::text)::integer, 0) AS "captainsId",
        CASE
            WHEN COALESCE((captain_info.value ->> 'ledaId'::text)::integer, 0) = 0 THEN 'NO CAPTAIN'::text
            ELSE COALESCE(concat(COALESCE(cp."firstName", ''::text), ' ', COALESCE(cp."middleInitial", ''::character varying), ' ', COALESCE(cp."lastName", ''::text)), 'NO CAPTAIN'::text)
        END AS "captainFullName",
    teams_final.season_code AS "seasonCode",
    teams_final.team_key AS "teamLetter"
   FROM ( SELECT subdivisions_expanded.division_key AS division_name,
            subdivisions_expanded.subdivision_key AS subdivision_name,
            teams.key AS team_key,
            teams.value AS team_info,
            subdivisions_expanded.season_code
           FROM ( SELECT divisions.key AS division_key,
                    subdivisions.key AS subdivision_key,
                    subdivisions.value AS subdivision_value,
                    lri."seasonCode" AS season_code
                   FROM leda_roster_info lri,
                    LATERAL json_each(lri."teamInformation") divisions(key, value),
                    LATERAL json_each(divisions.value -> 'subdivisions'::text) subdivisions(key, value)) subdivisions_expanded,
            LATERAL json_each(subdivisions_expanded.subdivision_value) teams(key, value)) teams_final
     LEFT JOIN leda_place_info lpi ON ((teams_final.team_info ->> 'placeId'::text)::integer) = lpi."ledaId"
     LEFT JOIN leda_team_info lti ON ((teams_final.team_info ->> 'teamId'::text)::integer) = lti."ledaId"
     LEFT JOIN LATERAL ( SELECT captain_members.value
           FROM json_each(lti."memberIdList") captain_members(key, value)
          WHERE ((captain_members.value ->> 'isCaptain'::text)::boolean) = true
         LIMIT 1) captain_info ON true
     LEFT JOIN leda_player_info cp ON COALESCE((captain_info.value ->> 'ledaId'::text)::integer, 0) = cp."ledaId";

ALTER TABLE public.leda_reports_captains_mtg_folder_labels
    OWNER TO admin;