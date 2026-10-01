-- View: public.leda_reports_league_play_mentions_best_of_division

-- DROP VIEW public.leda_reports_league_play_mentions_best_of_division;

CREATE OR REPLACE VIEW public.leda_reports_league_play_mentions_best_of_division
 AS
 WITH player_mention_counts AS (
         SELECT lr."seasonCode",
            lr.division,
            lr."mentionCode",
            lr."mentionDesc",
            mm."mentionBasis",
            lr."ledaId",
            lr."fullName",
            lr."teamId",
            lr."teamName",
            lr.count,
            count(*) AS "mentionCount"
           FROM leda_reports_league_play_mentions lr
             JOIN maint.leda_maint_mentions mm ON lr."mentionCode" = mm."mentionCode"
          WHERE mm."mentionBasis" IS NOT NULL AND TRIM(BOTH FROM mm."mentionBasis") <> ''::text AND mm."mentionBasis" <> 'NONE'::text AND lr."weekNum" > 0
          GROUP BY lr."seasonCode", lr.division, lr."mentionCode", lr."mentionDesc", mm."mentionBasis", lr."ledaId", lr."fullName", lr."teamId", lr."teamName", lr.count
        )
 SELECT "seasonCode",
    division,
    "mentionCode",
    "mentionDesc",
    "mentionBasis",
    "ledaId",
    "fullName",
    "teamId",
    "teamName",
    count,
    "mentionCount"
   FROM ( SELECT pmc."seasonCode",
            pmc.division,
            pmc."mentionCode",
            pmc."mentionDesc",
            pmc."mentionBasis",
            pmc."ledaId",
            pmc."fullName",
            pmc."teamId",
            pmc."teamName",
            pmc.count,
            pmc."mentionCount",
            rank() OVER (PARTITION BY pmc."seasonCode", pmc.division, pmc."mentionCode", pmc."mentionBasis" ORDER BY (
                CASE
                    WHEN pmc."mentionBasis" = 'LOW'::text THEN pmc.count
                    WHEN pmc."mentionBasis" = 'HIGH'::text THEN - pmc.count
                    ELSE - pmc.count
                END), pmc."mentionCount" DESC) AS rnk
           FROM player_mention_counts pmc) t
  WHERE rnk = 1
  ORDER BY "seasonCode", division, "mentionCode", "mentionBasis", count, "mentionCount" DESC;

ALTER TABLE public.leda_reports_league_play_mentions_best_of_division
    OWNER TO admin;

