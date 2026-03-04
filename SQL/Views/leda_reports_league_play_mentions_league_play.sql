-- View: public.leda_reports_league_play_mentions_league_play

-- DROP VIEW public.leda_reports_league_play_mentions_league_play;

CREATE OR REPLACE VIEW public.leda_reports_league_play_mentions_league_play
 AS
 SELECT "ledaId",
    "fullName",
    "isCaptain",
    "teamId",
    "teamName",
    name AS "placeName",
    "divisionInfo",
    "seasonCode",
    "mentionsCount",
    json_agg(json_build_object('weekNum', "weekNum", 'mentionCode', "mentionCode", 'mentionDesc', "mentionDesc", 'count', count) ORDER BY "weekNum", "mentionCode") AS mentions
   FROM leda_reports_league_play_mentions
  GROUP BY "ledaId", "fullName", "isCaptain", "teamId", "teamName", name, "divisionInfo", "seasonCode", "mentionsCount"
  ORDER BY "fullName", "seasonCode";

ALTER TABLE public.leda_reports_league_play_mentions_league_play
    OWNER TO admin;

