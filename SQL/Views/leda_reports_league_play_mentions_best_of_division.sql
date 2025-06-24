-- View: public.leda_reports_league_play_mentions_best_of_division

-- DROP VIEW public.leda_reports_league_play_mentions_best_of_division;

CREATE OR REPLACE VIEW public.leda_reports_league_play_mentions_best_of_division
 AS
 SELECT lr."ledaId",
    lr."fullName",
    lr."teamId",
    lr."teamName",
    lr.division,
    lr."seasonCode",
    lr."mentionCode",
    lr."mentionDesc",
    mm."mentionBasis",
    count(*) AS "mentionCount"
   FROM leda_reports_league_play_mentions lr
     JOIN maint.leda_maint_mentions mm ON lr."mentionCode" = mm."mentionCode"
  WHERE mm."mentionBasis" <> 'NONE'::text
  GROUP BY lr."ledaId", lr."fullName", lr."teamId", lr."teamName", lr.division, lr."seasonCode", lr."mentionCode", lr."mentionDesc", mm."mentionBasis"
  ORDER BY lr."fullName", lr."seasonCode", lr."mentionCode";

ALTER TABLE public.leda_reports_league_play_mentions_best_of_division
    OWNER TO admin;

