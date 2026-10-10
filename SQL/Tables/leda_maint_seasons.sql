-- Table: maint.leda_maint_seasons

-- DROP TABLE IF EXISTS maint.leda_maint_seasons;

CREATE TABLE IF NOT EXISTS maint.leda_maint_seasons
(
    id bigserial NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    "fiscalYear" text COLLATE pg_catalog."default" NOT NULL,
    dates json NOT NULL,
    "isCurrentSeason" boolean NOT NULL,
    "backupPlaceId" text COLLATE pg_catalog."default",
    "backupPlaceIds" text[] COLLATE pg_catalog."default" NOT NULL DEFAULT '{}'::text[],
    CONSTRAINT leda_maint_seasons_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_maint_seasons_seasonCode_key" UNIQUE ("seasonCode")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_seasons
    OWNER to admin;
-- Index: idx_maint_seasons_season_code

-- DROP INDEX IF EXISTS maint.idx_maint_seasons_season_code;

CREATE INDEX IF NOT EXISTS idx_maint_seasons_season_code
    ON maint.leda_maint_seasons USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST)
;