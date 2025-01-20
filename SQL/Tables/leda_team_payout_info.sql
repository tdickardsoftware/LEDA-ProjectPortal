-- Table: public.leda_team_payout_info

-- DROP TABLE IF EXISTS public.leda_team_payout_info;

CREATE TABLE IF NOT EXISTS public.leda_team_payout_info
(
    id bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "teamId" bigint NOT NULL,
    "payoutCheckAdjustedAmount" numeric(12,2) NOT NULL,
    "payoutCheckAdjustmentReason" text COLLATE pg_catalog."default",
    "payoutCheckGrossAmount" numeric(12,2) NOT NULL,
    "payoutCheckNumber" bigint NOT NULL,
    CONSTRAINT leda_team_payout_info_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_team_payout_info
    OWNER to admin;