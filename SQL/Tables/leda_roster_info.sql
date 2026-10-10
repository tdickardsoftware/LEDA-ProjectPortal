-- Table: public.leda_roster_info

-- DROP TABLE IF EXISTS public.leda_roster_info;

CREATE TABLE IF NOT EXISTS public.leda_roster_info
(
    id bigserial NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "teamInformation" jsonb,
    CONSTRAINT leda_roster_info_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_roster_info_seasonCode_key" UNIQUE ("seasonCode")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_roster_info
    OWNER to admin;
-- Index: idx_leda_roster_info_season

-- DROP INDEX IF EXISTS public.idx_leda_roster_info_season;

CREATE INDEX IF NOT EXISTS idx_leda_roster_info_season
    ON public.leda_roster_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST)
;
-- Index: idx_leda_roster_info_team_info_gin

-- DROP INDEX IF EXISTS public.idx_leda_roster_info_team_info_gin;

CREATE INDEX IF NOT EXISTS idx_leda_roster_info_team_info_gin
    ON public.leda_roster_info USING gin
    ("teamInformation")
;
-- Index: idx_roster_info_season_code

-- DROP INDEX IF EXISTS public.idx_roster_info_season_code;

CREATE INDEX IF NOT EXISTS idx_roster_info_season_code
    ON public.leda_roster_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST)
;

-- Trigger: trg_roster_refresh

-- DROP TRIGGER IF EXISTS trg_roster_refresh ON public.leda_roster_info;

CREATE OR REPLACE TRIGGER trg_roster_refresh
    AFTER INSERT OR DELETE OR UPDATE 
    ON public.leda_roster_info
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.refresh_roster_mv();