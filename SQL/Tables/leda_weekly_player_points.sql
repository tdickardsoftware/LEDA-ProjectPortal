-- Table: public.leda_weekly_player_points

-- DROP TABLE IF EXISTS public.leda_weekly_player_points;

CREATE TABLE IF NOT EXISTS public.leda_weekly_player_points
(
    id bigserial NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    "ledaId" bigint NOT NULL,
    "prevTotalPoints" bigint NOT NULL DEFAULT 0,
    "totalPoints" bigint NOT NULL,
    "teamLedaId" bigint NOT NULL,
    division text COLLATE pg_catalog."default" NOT NULL,
    subdivision text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_weekly_player_points_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_weekly_player_points_seasonCode_weekNum_ledaId_teamLed_key" UNIQUE ("seasonCode", "weekNum", "ledaId", "teamLedaId", division, subdivision)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_player_points
    OWNER to admin;
-- Index: idx_leda_weekly_player_points_max_week

-- DROP INDEX IF EXISTS public.idx_leda_weekly_player_points_max_week;

CREATE INDEX IF NOT EXISTS idx_leda_weekly_player_points_max_week
    ON public.leda_weekly_player_points USING btree
    ("ledaId" ASC NULLS LAST, "teamLedaId" ASC NULLS LAST, "seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" DESC NULLS FIRST)
;
-- Index: leda_weekly_player_points_seasonCode_ledaId_teamLedaId_tota_idx

-- DROP INDEX IF EXISTS public."leda_weekly_player_points_seasonCode_ledaId_teamLedaId_tota_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_player_points_seasonCode_ledaId_teamLedaId_tota_idx"
    ON public.leda_weekly_player_points USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, "teamLedaId" ASC NULLS LAST, "totalPoints" DESC NULLS FIRST)
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_player_points_seasonCode_ledaId_teamLedaId_wee_idx1

-- DROP INDEX IF EXISTS public."leda_weekly_player_points_seasonCode_ledaId_teamLedaId_wee_idx1";

CREATE INDEX IF NOT EXISTS "leda_weekly_player_points_seasonCode_ledaId_teamLedaId_wee_idx1"
    ON public.leda_weekly_player_points USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, "teamLedaId" ASC NULLS LAST, "weekNum" DESC NULLS FIRST)
    INCLUDE("totalPoints")
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_player_points_seasonCode_ledaId_teamLedaId_week_idx

-- DROP INDEX IF EXISTS public."leda_weekly_player_points_seasonCode_ledaId_teamLedaId_week_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_player_points_seasonCode_ledaId_teamLedaId_week_idx"
    ON public.leda_weekly_player_points USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, "teamLedaId" ASC NULLS LAST, "weekNum" DESC NULLS FIRST)
    WITH (deduplicate_items=True)
;