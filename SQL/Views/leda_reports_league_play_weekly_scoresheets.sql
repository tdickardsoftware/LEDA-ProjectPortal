-- View: public.leda_reports_league_play_weekly_scoresheets

-- DROP VIEW public.leda_reports_league_play_weekly_scoresheets;

CREATE OR REPLACE VIEW public.leda_reports_league_play_weekly_scoresheets
 AS
 SELECT DISTINCT wsti."seasonCode",
    wsti."weekNum",
    wsti.division,
    wsti.subdivision,
    wsti."teamId" AS "teamLedaId",
    wsti."teamLetter",
    wsti."teamName",
    wsti."teamLabel" AS "divisionInfo",
    wsti."totalPenaltyPoints" AS "penaltyPoints",
    wsti."previousPenaltyPoints",
    wts."totalPoints",
    wts."prevTotalPoints",
    wts."totalPoints" - wts."prevTotalPoints" AS "pointsScored",
    pi.name AS "placeName"
   FROM leda_weekly_scoresheets_team_info wsti
     JOIN leda_weekly_team_scores wts ON wsti."seasonCode" = wts."seasonCode" AND wsti."weekNum" = wts."weekNum" AND wsti."teamId" = wts."teamLedaId"
     JOIN leda_roster_teams_view rtv ON wsti."seasonCode" = rtv."seasonCode" AND wsti."teamId" = rtv."teamId"
     LEFT JOIN leda_place_info pi ON rtv."placeId"::bigint = pi."ledaId";

ALTER TABLE public.leda_reports_league_play_weekly_scoresheets
    OWNER TO admin;

