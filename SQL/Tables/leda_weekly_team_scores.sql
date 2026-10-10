-- Table: public.leda_weekly_team_scores

-- DROP TABLE IF EXISTS public.leda_weekly_team_scores;

CREATE TABLE IF NOT EXISTS public.leda_weekly_team_scores
(
    id bigserial NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    "teamLedaId" bigint NOT NULL,
    "prevTotalPoints" bigint NOT NULL DEFAULT 0,
    "totalPoints" bigint NOT NULL,
    division text COLLATE pg_catalog."default" NOT NULL,
    subdivision text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_weekly_team_scores_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_weekly_team_scores_seasonCode_weekNum_teamLedaId_divis_key" UNIQUE ("seasonCode", "weekNum", "teamLedaId", division, subdivision)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_team_scores
    OWNER to admin;
-- Index: leda_weekly_team_scores_seasonCode_teamLedaId_weekNum_total_idx

-- DROP INDEX IF EXISTS public."leda_weekly_team_scores_seasonCode_teamLedaId_weekNum_total_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_team_scores_seasonCode_teamLedaId_weekNum_total_idx"
    ON public.leda_weekly_team_scores USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "teamLedaId" ASC NULLS LAST, "weekNum" ASC NULLS LAST)
    INCLUDE("totalPoints")
    WITH (deduplicate_items=True)
;