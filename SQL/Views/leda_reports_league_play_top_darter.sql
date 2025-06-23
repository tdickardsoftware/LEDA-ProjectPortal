-- View: public.leda_reports_league_play_top_darter

-- DROP VIEW public.leda_reports_league_play_top_darter;

CREATE OR REPLACE VIEW public.leda_reports_league_play_top_darter
 AS
 SELECT DISTINCT ON (lwp."seasonCode", lwp."ledaId", lwp."teamLedaId") lwp."seasonCode",
    lwp."ledaId",
    concat_ws(' '::text, NULLIF(lpi."firstName", ''::text), NULLIF(lpi."middleInitial"::text, ''::text), NULLIF(lpi."lastName", ''::text)) AS "fullName",
    lwp."teamLedaId",
    lwp."totalPoints",
    lrt."divisionInfo"
   FROM leda_weekly_player_points lwp
     LEFT JOIN leda_player_info lpi ON lwp."ledaId" = lpi."ledaId"
     LEFT JOIN leda_roster_teams_view lrt ON lwp."teamLedaId"::text = lrt.ledaid
  ORDER BY lwp."seasonCode", lwp."ledaId", lwp."teamLedaId", lwp."totalPoints" DESC;

ALTER TABLE public.leda_reports_league_play_top_darter
    OWNER TO admin;

