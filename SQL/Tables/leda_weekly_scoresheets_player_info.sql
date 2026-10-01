-- Table: public.leda_weekly_scoresheets_player_info

-- DROP TABLE IF EXISTS public.leda_weekly_scoresheets_player_info;

CREATE TABLE IF NOT EXISTS public.leda_weekly_scoresheets_player_info
(
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    division text COLLATE pg_catalog."default" NOT NULL,
    subdivision text COLLATE pg_catalog."default" NOT NULL,
    "ledaId" bigint NOT NULL,
    "teamId" bigint NOT NULL,
    "gameStats" jsonb NOT NULL,
    CONSTRAINT leda_weekly_scoresheets_player_info_pkey PRIMARY KEY ("seasonCode", "weekNum", division, subdivision, "ledaId", "teamId"),
    CONSTRAINT "leda_weekly_scoresheets_playe_seasonCode_weekNum_division_s_key" UNIQUE ("seasonCode", "weekNum", division, subdivision, "ledaId", "teamId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_scoresheets_player_info
    OWNER to admin;
-- Index:  

-- DROP INDEX IF EXISTS public." ";

CREATE INDEX IF NOT EXISTS " "
    ON public.leda_weekly_scoresheets_player_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, "teamId" ASC NULLS LAST, "weekNum" DESC NULLS FIRST)
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_scoresheets_playe_seasonCode_ledaId_teamId_wee_idx1

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_playe_seasonCode_ledaId_teamId_wee_idx1";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_playe_seasonCode_ledaId_teamId_wee_idx1"
    ON public.leda_weekly_scoresheets_player_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, "teamId" ASC NULLS LAST, "weekNum" DESC NULLS FIRST)
    INCLUDE(division, subdivision)
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_scoresheets_playe_seasonCode_ledaId_teamId_week_idx

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_playe_seasonCode_ledaId_teamId_week_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_playe_seasonCode_ledaId_teamId_week_idx"
    ON public.leda_weekly_scoresheets_player_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, "teamId" ASC NULLS LAST, "weekNum" DESC NULLS FIRST, division COLLATE pg_catalog."default" ASC NULLS LAST, subdivision COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_scoresheets_playe_seasonCode_teamId_weekNum_led_idx

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_playe_seasonCode_teamId_weekNum_led_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_playe_seasonCode_teamId_weekNum_led_idx"
    ON public.leda_weekly_scoresheets_player_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "teamId" ASC NULLS LAST, "weekNum" DESC NULLS FIRST, "ledaId" ASC NULLS LAST)
    INCLUDE(division, subdivision)
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_scoresheets_playe_seasonCode_weekNum_division_s_idx

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_playe_seasonCode_weekNum_division_s_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_playe_seasonCode_weekNum_division_s_idx"
    ON public.leda_weekly_scoresheets_player_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST)
    INCLUDE("weekNum", division, subdivision, "ledaId", "teamId")
    WITH (deduplicate_items=True)
;
-- Index: leda_wspi_lookup_team_week

-- DROP INDEX IF EXISTS public.leda_wspi_lookup_team_week;

CREATE INDEX IF NOT EXISTS leda_wspi_lookup_team_week
    ON public.leda_weekly_scoresheets_player_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST, "teamId" ASC NULLS LAST)
;
-- Index: leda_wspi_uniq

-- DROP INDEX IF EXISTS public.leda_wspi_uniq;

CREATE UNIQUE INDEX IF NOT EXISTS leda_wspi_uniq
    ON public.leda_weekly_scoresheets_player_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST, division COLLATE pg_catalog."default" ASC NULLS LAST, subdivision COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, "teamId" ASC NULLS LAST)
;