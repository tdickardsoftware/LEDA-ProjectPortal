-- View: public.leda_reports_league_play_mentions_for_plaque

-- DROP VIEW public.leda_reports_league_play_mentions_for_plaque;

CREATE OR REPLACE VIEW public.leda_reports_league_play_mentions_for_plaque
 AS
 SELECT "seasonCode",
    "ledaId",
    "fullName",
    "divisionInfo",
    "teamName",
    "mentionsCount",
    json_agg(json_build_object('mentionDesc', "mentionDesc", 'count', count)) AS mentions
   FROM leda_reports_league_play_mentions
  GROUP BY "seasonCode", "ledaId", "fullName", "divisionInfo", "teamName", "mentionsCount"
  ORDER BY "ledaId";

ALTER TABLE public.leda_reports_league_play_mentions_for_plaque
    OWNER TO admin;

