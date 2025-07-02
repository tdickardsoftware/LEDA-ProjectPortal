-- View: public.leda_reports_league_play_ton_80

-- DROP VIEW public.leda_reports_league_play_ton_80;

CREATE OR REPLACE VIEW public.leda_reports_league_play_ton_80
 AS
 WITH week_counts AS (
         SELECT pmh."ledaId",
            pmh."teamId",
            pmh."seasonCode",
            pmh."weekNum",
            sum(
                CASE
                    WHEN pmh."mentionCode" = 'T71'::text THEN 1
                    ELSE 0
                END) AS t71count,
            sum(
                CASE
                    WHEN pmh."mentionCode" = 'T80'::text THEN 1
                    ELSE 0
                END) AS t80count
           FROM leda_player_mention_history pmh
          WHERE pmh."mentionCode" = ANY (ARRAY['T71'::text, 'T80'::text])
          GROUP BY pmh."ledaId", pmh."teamId", pmh."seasonCode", pmh."weekNum"
        )
 SELECT wc."ledaId",
    concat(COALESCE(lpi."firstName", ''::text), ' ', COALESCE(lpi."middleInitial", ''::character varying), ' ', COALESCE(lpi."lastName", ''::text)) AS "fullName",
    wc."teamId",
    wc."seasonCode",
    wc."weekNum",
    sum(wc.t71count) OVER (PARTITION BY wc."ledaId", wc."seasonCode" ORDER BY wc."weekNum" ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "t71Cumulative",
    sum(wc.t80count) OVER (PARTITION BY wc."ledaId", wc."seasonCode" ORDER BY wc."weekNum" ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "t80Cumulative"
   FROM week_counts wc
     LEFT JOIN leda_player_info lpi ON wc."ledaId" = lpi."ledaId"
  ORDER BY wc."ledaId", wc."seasonCode", wc."weekNum";

ALTER TABLE public.leda_reports_league_play_ton_80
    OWNER TO admin;

