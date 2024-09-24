-- Table: maint.leda_maint_seasons

-- DROP TABLE IF EXISTS maint.leda_maint_seasons;

CREATE TABLE IF NOT EXISTS maint.leda_maint_seasons
(
    id bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    "fiscalYear" text COLLATE pg_catalog."default" NOT NULL,
    "dates" json NOT NULL,
    "isCurrentSeason" boolean NOT NULL,
    CONSTRAINT leda_maint_seasons_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_seasons
    OWNER to admin;