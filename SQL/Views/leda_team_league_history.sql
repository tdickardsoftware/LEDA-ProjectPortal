-- View: public.leda_team_league_history

-- DROP VIEW public.leda_team_league_history;

CREATE OR REPLACE VIEW public.leda_team_league_history
 AS
 WITH team_labels AS (
         SELECT lri."seasonCode",
            upper("left"(division.key, 1)) AS "divisionLetter",
            regexp_replace(subdivision.key, '[^0-9]'::text, ''::text, 'g'::text) AS "subdivisionNumber",
            team.key AS "teamLetter",
            team.value ->> 'teamId'::text AS "ledaId",
            (upper("left"(division.key, 1)) || regexp_replace(subdivision.key, '[^0-9]'::text, ''::text, 'g'::text)) || team.key AS "teamLabel"
           FROM leda_roster_info lri,
            LATERAL json_each(lri."teamInfomation") division(key, value),
            LATERAL json_each(division.value -> 'subdivisions'::text) subdivision(key, value),
            LATERAL json_each(subdivision.value) team(key, value)
        )
 SELECT tl."seasonCode",
    tl."ledaId",
    tl."teamLabel",
    COALESCE(lts."totalPoints", 0::bigint) AS "totalPoints"
   FROM team_labels tl
     LEFT JOIN LATERAL ( SELECT lts_1."totalPoints"
           FROM leda_weekly_team_scores lts_1
          WHERE lts_1."seasonCode" = tl."seasonCode" AND lts_1."teamLedaId" = tl."ledaId"::bigint
          ORDER BY lts_1."weekNum" DESC
         LIMIT 1) lts ON true;

ALTER TABLE public.leda_team_league_history
    OWNER TO admin;

