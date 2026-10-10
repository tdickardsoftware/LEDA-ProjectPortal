-- Table: public.leda_weekly_scoresheets_team_game_info

-- DROP TABLE IF EXISTS public.leda_weekly_scoresheets_team_game_info;

CREATE TABLE IF NOT EXISTS public.leda_weekly_scoresheets_team_game_info
(
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    division text COLLATE pg_catalog."default" NOT NULL,
    subdivision text COLLATE pg_catalog."default" NOT NULL,
    "homeTeamId" bigint NOT NULL,
    "awayTeamId" bigint NOT NULL,
    "homePoints" bigint NOT NULL DEFAULT 0,
    "awayPoints" bigint NOT NULL DEFAULT 0,
    "gameInfo" jsonb NOT NULL,
    completed boolean NOT NULL DEFAULT false,
    CONSTRAINT "leda_weekly_scoresheets_team__seasonCode_weekNum_division_s_key" UNIQUE ("seasonCode", "weekNum", division, subdivision, "homeTeamId", "awayTeamId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_scoresheets_team_game_info
    OWNER to admin;
-- Index: idx_wsgi_matchup_completed

-- DROP INDEX IF EXISTS public.idx_wsgi_matchup_completed;

CREATE INDEX IF NOT EXISTS idx_wsgi_matchup_completed
    ON public.leda_weekly_scoresheets_team_game_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST, division COLLATE pg_catalog."default" ASC NULLS LAST, subdivision COLLATE pg_catalog."default" ASC NULLS LAST, LEAST("homeTeamId", "awayTeamId") ASC NULLS LAST, GREATEST("homeTeamId", "awayTeamId") ASC NULLS LAST, completed ASC NULLS LAST)
;
-- Index: leda_wstgi_uniq

-- DROP INDEX IF EXISTS public.leda_wstgi_uniq;

CREATE UNIQUE INDEX IF NOT EXISTS leda_wstgi_uniq
    ON public.leda_weekly_scoresheets_team_game_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST, division COLLATE pg_catalog."default" ASC NULLS LAST, subdivision COLLATE pg_catalog."default" ASC NULLS LAST, "homeTeamId" ASC NULLS LAST, "awayTeamId" ASC NULLS LAST)
    INCLUDE(completed)
;