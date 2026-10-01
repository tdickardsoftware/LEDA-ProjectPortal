-- View: public.leda_activities_missing_scoresheets

-- DROP VIEW public.leda_activities_missing_scoresheets;

CREATE OR REPLACE VIEW public.leda_activities_missing_scoresheets
 AS
 WITH expected_matchups AS (
         SELECT DISTINCT s_1."seasonCode",
            s_1."weekNum",
            s_1.division,
            s_1.subdivision,
            LEAST(s_1."teamId", s_1."oppTeamId") AS "teamAId",
            GREATEST(s_1."teamId", s_1."oppTeamId") AS "teamBId"
           FROM leda_schedule s_1
          WHERE COALESCE(s_1."teamId", 0::bigint) <> 0 AND COALESCE(s_1."oppTeamId", 0::bigint) <> 0
        ), scoresheet_status AS (
         SELECT g."seasonCode",
            g."weekNum",
            g.division,
            g.subdivision,
            LEAST(g."homeTeamId", g."awayTeamId") AS "teamAId",
            GREATEST(g."homeTeamId", g."awayTeamId") AS "teamBId",
            bool_or(COALESCE(g.completed, false)) AS "anyCompleted"
           FROM leda_weekly_scoresheets_team_game_info g
          GROUP BY g."seasonCode", g."weekNum", g.division, g.subdivision, (LEAST(g."homeTeamId", g."awayTeamId")), (GREATEST(g."homeTeamId", g."awayTeamId"))
        )
 SELECT e."seasonCode",
    e."weekNum",
    e.division,
    e.subdivision,
    e."teamAId",
    e."teamBId",
        CASE
            WHEN s."teamAId" IS NULL THEN 'MISSING'::text
            ELSE 'COMPLETED_FALSE'::text
        END AS "issueType"
   FROM expected_matchups e
     LEFT JOIN scoresheet_status s ON s."seasonCode" = e."seasonCode" AND s."weekNum" = e."weekNum" AND s.division = e.division AND s.subdivision = e.subdivision AND s."teamAId" = e."teamAId" AND s."teamBId" = e."teamBId"
  WHERE s."teamAId" IS NULL OR s."anyCompleted" = false
  ORDER BY e."seasonCode", e."weekNum", e.division, e.subdivision, e."teamAId", e."teamBId";

ALTER TABLE public.leda_activities_missing_scoresheets
    OWNER TO admin;

