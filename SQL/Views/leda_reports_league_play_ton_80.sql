-- View: public.leda_reports_league_play_ton_80

-- DROP VIEW public.leda_reports_league_play_ton_80;

CREATE OR REPLACE VIEW public.leda_reports_league_play_ton_80
 AS
 SELECT pmh."ledaId",
    concat(COALESCE(lpi."firstName", ''::text), ' ', COALESCE(lpi."middleInitial", ''::character varying), ' ', COALESCE(lpi."lastName", ''::text)) AS "fullName",
    pmh."teamId",
    pmh."seasonCode",
    pmh."weekNum",
    sum(
        CASE
            WHEN pmh."mentionCode" = 'T71'::text THEN 1
            ELSE 0
        END) OVER (PARTITION BY pmh."ledaId", pmh."seasonCode" ORDER BY pmh."weekNum" ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "t71Cumulative",
    sum(
        CASE
            WHEN pmh."mentionCode" = 'T80'::text THEN 1
            ELSE 0
        END) OVER (PARTITION BY pmh."ledaId", pmh."seasonCode" ORDER BY pmh."weekNum" ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "t80Cumulative"
   FROM leda_player_mention_history pmh
     LEFT JOIN leda_player_info lpi ON pmh."ledaId" = lpi."ledaId"
  WHERE pmh."mentionCode" = ANY (ARRAY['T71'::text, 'T80'::text])
  ORDER BY pmh."ledaId", pmh."seasonCode", pmh."weekNum";

ALTER TABLE public.leda_reports_league_play_ton_80
    OWNER TO admin;

