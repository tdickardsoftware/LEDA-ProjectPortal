-- Table: public.leda_membership_info

-- DROP TABLE IF EXISTS public.leda_membership_info;

CREATE TABLE IF NOT EXISTS public.leda_membership_info
(
    id bigserial NOT NULL,
    "ledaId" bigint,
    "establishedDate" date NOT NULL,
    "badStanding" boolean NOT NULL,
    "badStandingReason" text COLLATE pg_catalog."default",
    "takeOffMailing" boolean NOT NULL,
    "mailStandings" boolean NOT NULL,
    "formOnFile" boolean NOT NULL,
    "needsMemberCard" boolean NOT NULL,
    "inactiveDate" date,
    "lastMembershipFeePayment" text COLLATE pg_catalog."default" NOT NULL,
    "lastTrailsDate" date,
    "memberType" text COLLATE pg_catalog."default" NOT NULL,
    "cannotBeCaptain" boolean NOT NULL,
    "lifetimeMember" boolean NOT NULL,
    "lifetimeMemberReason" text COLLATE pg_catalog."default",
    CONSTRAINT leda_membership_info_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_membership_info_ledaId_key" UNIQUE ("ledaId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_membership_info
    OWNER to admin;
-- Index: idx_leda_membership_info_ledaid

-- DROP INDEX IF EXISTS public.idx_leda_membership_info_ledaid;

CREATE INDEX IF NOT EXISTS idx_leda_membership_info_ledaid
    ON public.leda_membership_info USING btree
    ("ledaId" ASC NULLS LAST)
;
-- Index: idx_membership_info_status

-- DROP INDEX IF EXISTS public.idx_membership_info_status;

CREATE INDEX IF NOT EXISTS idx_membership_info_status
    ON public.leda_membership_info USING btree
    ("ledaId" ASC NULLS LAST, "lifetimeMember" ASC NULLS LAST, "badStanding" ASC NULLS LAST, "establishedDate" ASC NULLS LAST)
;
-- Index: leda_membership_info_ledaId_idx

-- DROP INDEX IF EXISTS public."leda_membership_info_ledaId_idx";

CREATE INDEX IF NOT EXISTS "leda_membership_info_ledaId_idx"
    ON public.leda_membership_info USING btree
    ("ledaId" ASC NULLS LAST)
    WITH (deduplicate_items=True)
;