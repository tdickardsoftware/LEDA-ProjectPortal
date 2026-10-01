-- Table: public.leda_schedule

-- DROP TABLE IF EXISTS public.leda_schedule;

CREATE TABLE IF NOT EXISTS public.leda_schedule
(
    id bigserial NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    division text COLLATE pg_catalog."default" NOT NULL,
    subdivision text COLLATE pg_catalog."default" NOT NULL,
    "teamId" bigint NOT NULL,
    "teamName" text COLLATE pg_catalog."default" NOT NULL,
    "teamLetter" character varying(1) COLLATE pg_catalog."default" NOT NULL,
    "oppTeamId" bigint NOT NULL,
    "oppTeamLetter" character varying(1) COLLATE pg_catalog."default" NOT NULL,
    home boolean NOT NULL,
    "matchDateTime" timestamp without time zone NOT NULL,
    "isBackupLocation" boolean NOT NULL DEFAULT false,
    "backupPlaceId" text COLLATE pg_catalog."default",
    CONSTRAINT leda_schedule_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_schedule
    OWNER to admin;
-- Index: idx_leda_schedule_seasoncode

-- DROP INDEX IF EXISTS public.idx_leda_schedule_seasoncode;

CREATE INDEX IF NOT EXISTS idx_leda_schedule_seasoncode
    ON public.leda_schedule USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST)
;
-- Index: idx_sched_expected_matchup

-- DROP INDEX IF EXISTS public.idx_sched_expected_matchup;

CREATE INDEX IF NOT EXISTS idx_sched_expected_matchup
    ON public.leda_schedule USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST, division COLLATE pg_catalog."default" ASC NULLS LAST, subdivision COLLATE pg_catalog."default" ASC NULLS LAST, LEAST("teamId", "oppTeamId") ASC NULLS LAST, GREATEST("teamId", "oppTeamId") ASC NULLS LAST)

    WHERE COALESCE("teamId", 0::bigint) <> 0 AND COALESCE("oppTeamId", 0::bigint) <> 0;