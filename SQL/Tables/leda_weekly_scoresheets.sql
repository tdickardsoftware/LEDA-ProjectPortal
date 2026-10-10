-- Table: public.leda_weekly_scoresheets

-- DROP TABLE IF EXISTS public.leda_weekly_scoresheets;

CREATE TABLE IF NOT EXISTS public.leda_weekly_scoresheets
(
    id bigserial NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    "scoresheetData" jsonb NOT NULL,
    "finishedScoresheet" boolean,
    CONSTRAINT leda_weekly_scoresheets_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_weekly_scoresheets_seasonCode_weekNum_key" UNIQUE ("seasonCode", "weekNum")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_scoresheets
    OWNER to admin;
-- Index: idx_leda_weekly_scoresheets_scoresheet_data_gin

-- DROP INDEX IF EXISTS public.idx_leda_weekly_scoresheets_scoresheet_data_gin;

CREATE INDEX IF NOT EXISTS idx_leda_weekly_scoresheets_scoresheet_data_gin
    ON public.leda_weekly_scoresheets USING gin
    ("scoresheetData")
;
-- Index: idx_leda_weekly_scoresheets_season

-- DROP INDEX IF EXISTS public.idx_leda_weekly_scoresheets_season;

CREATE INDEX IF NOT EXISTS idx_leda_weekly_scoresheets_season
    ON public.leda_weekly_scoresheets USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST)
;
-- Index: leda_weekly_scoresheets_seasonCode_weekNum_idx

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_seasonCode_weekNum_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_seasonCode_weekNum_idx"
    ON public.leda_weekly_scoresheets USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST)
    INCLUDE("weekNum")
    WITH (deduplicate_items=True)
;