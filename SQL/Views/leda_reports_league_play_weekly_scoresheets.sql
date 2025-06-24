-- View: public.leda_reports_league_play_weekly_scoresheets

-- DROP VIEW public.leda_reports_league_play_weekly_scoresheets;

CREATE OR REPLACE VIEW public.leda_reports_league_play_weekly_scoresheets
 AS
 WITH weeks AS (
    SELECT DISTINCT "seasonCode", "weekNum"
    FROM leda_weekly_team_scores
),
all_teams AS (
    SELECT DISTINCT lrt.ledaid::bigint AS "teamLedaId",
           lrt."seasonCode",
           lrt."divisionInfo"
    FROM leda_roster_teams_view lrt
),
team_weeks AS (
    SELECT at."teamLedaId", at."seasonCode", at."divisionInfo", w."weekNum"
    FROM all_teams at
    JOIN weeks w ON at."seasonCode" = w."seasonCode"
),
scores AS (
    SELECT s."teamLedaId", s."seasonCode", s."weekNum", s."totalPoints"
    FROM leda_weekly_team_scores s
),
penalties AS (
    SELECT p."seasonCode", p."weekNum", p.team_id::bigint AS "teamLedaId",
           sum(p.points) AS penaltypoints
    FROM leda_team_penalty_history p
    GROUP BY p."seasonCode", p."weekNum", p.team_id
),
scored_with_prev AS (
    SELECT
        tw."teamLedaId",
        tw."seasonCode",
        tw."divisionInfo",
        tw."weekNum",
        COALESCE(s."totalPoints", 0) AS "totalPoints",
        COALESCE(
            LAG(COALESCE(s."totalPoints", 0)) OVER (
                PARTITION BY tw."teamLedaId", tw."seasonCode"
                ORDER BY tw."weekNum"
            ), 0
        ) AS "prevTotalPoints"
    FROM team_weeks tw
    LEFT JOIN scores s ON s."teamLedaId" = tw."teamLedaId"
                      AND s."seasonCode" = tw."seasonCode"
                      AND s."weekNum" = tw."weekNum"
)
SELECT
    swp."seasonCode",
    swp."teamLedaId",
    swp."weekNum",
    swp."divisionInfo",
    swp."prevTotalPoints",
    swp."totalPoints",
    CASE 
      WHEN swp."totalPoints" = 0 THEN 0
      ELSE swp."totalPoints" - swp."prevTotalPoints"
    END AS "pointsScored",
    COALESCE(penalties.penaltypoints, 0) AS "penaltyPoints"
FROM scored_with_prev swp
LEFT JOIN penalties
    ON penalties."teamLedaId" = swp."teamLedaId"
    AND penalties."seasonCode" = swp."seasonCode"
    AND penalties."weekNum" = swp."weekNum"
ORDER BY swp."teamLedaId", swp."seasonCode", swp."weekNum";

ALTER TABLE public.leda_reports_league_play_weekly_scoresheets
    OWNER TO admin;

