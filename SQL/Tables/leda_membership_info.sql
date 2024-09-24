-- Table: public.leda_membership_info

-- DROP TABLE IF EXISTS public.leda_membership_info;

CREATE TABLE IF NOT EXISTS public.leda_membership_info
(
    id bigint NOT NULL,
    "ledaId" bigint,
    "establishDate" date NOT NULL,
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
    "cannotBeCaptainin" boolean NOT NULL,
    "lifetimeMember" boolean NOT NULL,
    "lifetimeMemberReason" text COLLATE pg_catalog."default",
    CONSTRAINT leda_membership_info_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_membership_info
    OWNER to admin;