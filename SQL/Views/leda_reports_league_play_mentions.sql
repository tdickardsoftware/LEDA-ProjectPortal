-- View: public.leda_reports_league_play_mentions

-- DROP VIEW public.leda_reports_league_play_mentions;

CREATE OR REPLACE VIEW public.leda_reports_league_play_mentions
 AS
 SELECT pmh."ledaId",
    concat(COALESCE(lpi."lastName", ''::text), ', ', COALESCE(lpi."firstName", ''::text), ' ', COALESCE(lpi."middleInitial", ''::character varying)) AS "fullName",
    pti."isCaptain",
    pmh."teamId",
    lti."teamName",
    rtv."divisionInfo",
    rtv."placeId",
    pi.name,
    pmh."seasonCode",
    pmh."mentionCode",
    pmh."mentionDesc",
    pmh."weekNum",
    pmh.count,
    count(*) OVER (PARTITION BY pmh."ledaId", pmh."seasonCode", pmh."teamId") AS "mentionsCount"
   FROM leda_player_mention_history pmh
     LEFT JOIN leda_player_info lpi ON pmh."ledaId" = lpi."ledaId"
     LEFT JOIN leda_roster_teams_view rtv ON pmh."teamId"::text = rtv.ledaid AND pmh."seasonCode" = rtv."seasonCode"
     LEFT JOIN leda_player_team_info pti ON pmh."ledaId"::text = pti."ledaId" AND pmh."teamId" = pti."teamLedaId"
     LEFT JOIN leda_team_info lti ON pmh."teamId" = lti."ledaId"
     LEFT JOIN leda_place_info pi ON rtv."placeId"::bigint = pi."ledaId";

ALTER TABLE public.leda_reports_league_play_mentions
    OWNER TO admin;

