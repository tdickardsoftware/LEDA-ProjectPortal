-- View: public.leda_reports_league_play_weekly_scoresheets

-- DROP VIEW public.leda_reports_league_play_weekly_scoresheets;

CREATE OR REPLACE VIEW public.leda_reports_league_play_weekly_scoresheets
 AS
 WITH weeks AS (
         SELECT DISTINCT leda_weekly_team_scores."seasonCode",
            leda_weekly_team_scores."weekNum"
           FROM leda_weekly_team_scores
        ), all_teams AS (
         SELECT DISTINCT lrt.ledaid::bigint AS "teamLedaId",
            lrt."seasonCode",
            lrt."divisionInfo",
            lrt.division,
            lrt.subdivision,
            lrt."teamLetter",
            lrt."placeId"
           FROM leda_roster_teams_view lrt
        ), team_weeks AS (
         SELECT at."teamLedaId",
            at."seasonCode",
            at."divisionInfo",
            at.division,
            at.subdivision,
            at."teamLetter",
            at."placeId",
            w."weekNum"
           FROM all_teams at
             JOIN weeks w ON at."seasonCode" = w."seasonCode"
        ), scores AS (
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
        ), penalties_full AS (
         SELECT tw."seasonCode",
            tw."weekNum",
            tw."teamLedaId",
            COALESCE(penalties.penaltypoints, 0::bigint) AS penaltypoints
           FROM team_weeks tw
             LEFT JOIN penalties ON penalties."seasonCode" = tw."seasonCode" AND penalties."weekNum" = tw."weekNum" AND penalties."teamLedaId" = tw."teamLedaId"
        ), penalties_with_prev AS (
         SELECT penalties_full."seasonCode",
            penalties_full."weekNum",
            penalties_full."teamLedaId",
            penalties_full.penaltypoints,
            lag(penalties_full.penaltypoints, 1, 0::bigint) OVER (PARTITION BY penalties_full."teamLedaId", penalties_full."seasonCode" ORDER BY penalties_full."weekNum") AS previouspenaltypoints
           FROM penalties_full
        ), scored_with_prev AS (
         SELECT tw."teamLedaId",
            tw."seasonCode",
            tw."divisionInfo",
            tw.division,
            tw.subdivision,
            tw."teamLetter",
            tw."weekNum",
            tw."placeId",
            COALESCE(s."totalPoints", 0::bigint) AS "totalPoints",
            COALESCE(lag(COALESCE(s."totalPoints", 0::bigint)) OVER (PARTITION BY tw."teamLedaId", tw."seasonCode" ORDER BY tw."weekNum"), 0::bigint) AS "prevTotalPoints"
           FROM team_weeks tw
             LEFT JOIN scores s ON s."teamLedaId" = tw."teamLedaId" AND s."seasonCode" = tw."seasonCode" AND s."weekNum" = tw."weekNum"
        )
 SELECT swp."seasonCode",
    swp."teamLedaId",
    swp."weekNum",
    swp."divisionInfo",
    swp.division,
    swp.subdivision,
    swp."teamLetter",
    swp."prevTotalPoints",
    swp."totalPoints",
        CASE
            WHEN swp."totalPoints" = 0 THEN 0::bigint
            ELSE swp."totalPoints" - swp."prevTotalPoints"
        END AS "pointsScored",
    COALESCE(penalties_with_prev.penaltypoints, 0::bigint) AS "penaltyPoints",
    COALESCE(penalties_with_prev.previouspenaltypoints, 0::bigint) AS "previousPenaltyPoints",
    lti."teamName",
    lpi.name AS "placeName"
   FROM scored_with_prev swp
     LEFT JOIN penalties_with_prev ON penalties_with_prev."teamLedaId" = swp."teamLedaId" AND penalties_with_prev."seasonCode" = swp."seasonCode" AND penalties_with_prev."weekNum" = swp."weekNum"
     LEFT JOIN leda_team_info lti ON lti."ledaId" = swp."teamLedaId"
     LEFT JOIN leda_place_info lpi ON lpi."ledaId"::text = swp."placeId"
  ORDER BY swp."teamLedaId", swp."seasonCode", swp."weekNum";

ALTER TABLE public.leda_reports_league_play_weekly_scoresheets
    OWNER TO admin;

