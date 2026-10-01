-- Table: public.leda_weekly_scoresheets_team_info

-- DROP TABLE IF EXISTS public.leda_weekly_scoresheets_team_info;

CREATE TABLE IF NOT EXISTS public.leda_weekly_scoresheets_team_info
(
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    division text COLLATE pg_catalog."default" NOT NULL,
    subdivision text COLLATE pg_catalog."default" NOT NULL,
    home boolean NOT NULL DEFAULT false,
    "teamId" bigint NOT NULL,
    "teamName" text COLLATE pg_catalog."default" NOT NULL,
    "teamLetter" character varying(1) COLLATE pg_catalog."default" NOT NULL,
    "opposingTeamId" bigint NOT NULL,
    penalties jsonb,
    "totalPenaltyPoints" bigint NOT NULL DEFAULT 0,
    "previousPenaltyPoints" bigint NOT NULL DEFAULT 0,
    "teamLabel" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "leda_weekly_scoresheets_team__seasonCode_weekNum_division__key1" UNIQUE ("seasonCode", "weekNum", division, subdivision, "teamId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_scoresheets_team_info
    OWNER to admin;
-- Index: idx_lw_teaminfo_penalties_gin

-- DROP INDEX IF EXISTS public.idx_lw_teaminfo_penalties_gin;

CREATE INDEX IF NOT EXISTS idx_lw_teaminfo_penalties_gin
    ON public.leda_weekly_scoresheets_team_info USING gin
    (penalties)
;
-- Index: leda_weekly_scoresheets_team__seasonCode_division_subdivisi_idx

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_team__seasonCode_division_subdivisi_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_team__seasonCode_division_subdivisi_idx"
    ON public.leda_weekly_scoresheets_team_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, division COLLATE pg_catalog."default" ASC NULLS LAST, subdivision COLLATE pg_catalog."default" ASC NULLS LAST, "teamId" ASC NULLS LAST)
    INCLUDE("teamLetter", "teamName")
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_scoresheets_team__seasonCode_teamId_weekNum_div_idx

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_team__seasonCode_teamId_weekNum_div_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_team__seasonCode_teamId_weekNum_div_idx"
    ON public.leda_weekly_scoresheets_team_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "teamId" ASC NULLS LAST)
    INCLUDE("weekNum", division, subdivision, "teamLetter", "teamName", penalties)
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_scoresheets_team_info_seasonCode_teamId_idx

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_team_info_seasonCode_teamId_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_team_info_seasonCode_teamId_idx"
    ON public.leda_weekly_scoresheets_team_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "teamId" ASC NULLS LAST)
    WITH (deduplicate_items=True)
;
-- Index: leda_weekly_scoresheets_team_info_seasonCode_weekNum_idx

-- DROP INDEX IF EXISTS public."leda_weekly_scoresheets_team_info_seasonCode_weekNum_idx";

CREATE INDEX IF NOT EXISTS "leda_weekly_scoresheets_team_info_seasonCode_weekNum_idx"
    ON public.leda_weekly_scoresheets_team_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST)
    WITH (deduplicate_items=True)
;
-- Index: leda_wsti_lookup_letter

-- DROP INDEX IF EXISTS public.leda_wsti_lookup_letter;

CREATE INDEX IF NOT EXISTS leda_wsti_lookup_letter
    ON public.leda_weekly_scoresheets_team_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST, division COLLATE pg_catalog."default" ASC NULLS LAST, subdivision COLLATE pg_catalog."default" ASC NULLS LAST, "teamLetter" COLLATE pg_catalog."default" ASC NULLS LAST)
;
-- Index: leda_wsti_lookup_opponent

-- DROP INDEX IF EXISTS public.leda_wsti_lookup_opponent;

CREATE INDEX IF NOT EXISTS leda_wsti_lookup_opponent
    ON public.leda_weekly_scoresheets_team_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST, "teamId" ASC NULLS LAST, "opposingTeamId" ASC NULLS LAST)
;
-- Index: leda_wsti_uniq

-- DROP INDEX IF EXISTS public.leda_wsti_uniq;

CREATE UNIQUE INDEX IF NOT EXISTS leda_wsti_uniq
    ON public.leda_weekly_scoresheets_team_info USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "weekNum" ASC NULLS LAST, division COLLATE pg_catalog."default" ASC NULLS LAST, subdivision COLLATE pg_catalog."default" ASC NULLS LAST, "teamId" ASC NULLS LAST)
;