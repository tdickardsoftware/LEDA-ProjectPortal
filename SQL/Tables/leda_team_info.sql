-- Table: public.leda_team_info

-- DROP TABLE IF EXISTS public.leda_team_info;

CREATE TABLE IF NOT EXISTS public.leda_team_info
(
    id bigserial NOT NULL,
    "ledaId" bigint,
    "teamName" text COLLATE pg_catalog."default" NOT NULL,
    "establishedDate" timestamp without time zone NOT NULL,
    memo text COLLATE pg_catalog."default",
    "lastTeamFeePayment" text COLLATE pg_catalog."default" NOT NULL,
    "memberIdList" jsonb NOT NULL,
    CONSTRAINT leda_team_info_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_team_info_ledaId_key" UNIQUE ("ledaId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_team_info
    OWNER to admin;
-- Index: idx_leda_team_info_ledaid

-- DROP INDEX IF EXISTS public.idx_leda_team_info_ledaid;

CREATE INDEX IF NOT EXISTS idx_leda_team_info_ledaid
    ON public.leda_team_info USING btree
    ("ledaId" ASC NULLS LAST)
;
-- Index: idx_leda_team_info_member_list_gin

-- DROP INDEX IF EXISTS public.idx_leda_team_info_member_list_gin;

CREATE INDEX IF NOT EXISTS idx_leda_team_info_member_list_gin
    ON public.leda_team_info USING gin
    ("memberIdList")
;
-- Index: idx_team_info_leda_id

-- DROP INDEX IF EXISTS public.idx_team_info_leda_id;

CREATE INDEX IF NOT EXISTS idx_team_info_leda_id
    ON public.leda_team_info USING btree
    ("ledaId" ASC NULLS LAST)
;