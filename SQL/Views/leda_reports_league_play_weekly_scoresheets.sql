-- View: public.leda_reports_league_play_weekly_scoresheets

-- DROP VIEW public.leda_reports_league_play_weekly_scoresheets;

CREATE OR REPLACE VIEW public.leda_reports_league_play_weekly_scoresheets
 AS
 WITH max_weeks AS (
         SELECT leda_weekly_team_scores."seasonCode",
            max(leda_weekly_team_scores."weekNum") AS max_weeknum
           FROM leda_weekly_team_scores
          GROUP BY leda_weekly_team_scores."seasonCode"
        ), all_teams AS (
         SELECT DISTINCT lrt.ledaid::bigint AS "teamLedaId",
            mw."seasonCode",
            mw.max_weeknum,
            lrt."divisionInfo"
           FROM leda_roster_teams_view lrt
             JOIN max_weeks mw ON lrt."seasonCode" = mw."seasonCode"
        ), last_scores AS (
         SELECT DISTINCT ON (s."teamLedaId", s."seasonCode") s."teamLedaId",
            s."seasonCode",
            s."weekNum" AS last_week,
            s."totalPoints" AS lasttotal
           FROM leda_weekly_team_scores s
          ORDER BY s."teamLedaId", s."seasonCode", s."weekNum" DESC
        ), scores AS (
         SELECT s."teamLedaId",
            s."seasonCode",
            s."weekNum",
            s."totalPoints"
           FROM leda_weekly_team_scores s
        ), prevs AS (
         SELECT s."teamLedaId",
            s."seasonCode",
            s."weekNum",
            s."totalPoints"
           FROM leda_weekly_team_scores s
        ), penalties AS (
         SELECT p."seasonCode",
            p."weekNum",
            p.team_id::bigint AS "teamLedaId",
            sum(p.points) AS penaltypoints
           FROM leda_team_penalty_history p
          GROUP BY p."seasonCode", p."weekNum", p.team_id
        )
 SELECT t."seasonCode",
    t."teamLedaId",
        CASE
            WHEN scores."totalPoints" IS NULL THEN COALESCE(ls.lasttotal, 0::bigint)
            ELSE COALESCE(prevs."totalPoints", 0::bigint)
        END AS "prevTotalPoints",
        CASE
            WHEN scores."totalPoints" IS NULL THEN COALESCE(ls.lasttotal, 0::bigint)
            ELSE COALESCE(scores."totalPoints", 0::bigint)
        END AS "totalPoints",
        CASE
            WHEN scores."totalPoints" IS NULL THEN 0::bigint
            ELSE COALESCE(scores."totalPoints", 0::bigint) - COALESCE(prevs."totalPoints", 0::bigint)
        END AS "pointsScored",
    t."divisionInfo",
    COALESCE(penalties.penaltypoints, 0::bigint) AS "penaltyPoints"
   FROM all_teams t
     LEFT JOIN scores ON scores."teamLedaId" = t."teamLedaId" AND scores."seasonCode" = t."seasonCode" AND scores."weekNum" = t.max_weeknum
     LEFT JOIN prevs ON prevs."teamLedaId" = t."teamLedaId" AND prevs."seasonCode" = t."seasonCode" AND prevs."weekNum" = (t.max_weeknum - 1)
     LEFT JOIN last_scores ls ON ls."teamLedaId" = t."teamLedaId" AND ls."seasonCode" = t."seasonCode"
     LEFT JOIN penalties ON penalties."teamLedaId" = t."teamLedaId" AND penalties."seasonCode" = t."seasonCode" AND penalties."weekNum" = t.max_weeknum
  ORDER BY t."teamLedaId", t."seasonCode";

ALTER TABLE public.leda_reports_league_play_weekly_scoresheets
    OWNER TO admin;

