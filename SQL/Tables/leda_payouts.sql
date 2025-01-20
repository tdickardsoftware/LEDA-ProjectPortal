-- Table: public.leda_payouts

-- DROP TABLE IF EXISTS public.leda_payouts;

CREATE TABLE IF NOT EXISTS public.leda_payouts
(
    id bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "ledaTeamId" bigint NOT NULL,
    "grossAmount" numeric(12,2) NOT NULL,
    "adjustmentAmount" numeric(12,2),
    "checkNotation" text COLLATE pg_catalog."default",
    "netAmount" numeric(12,2) NOT NULL,
    CONSTRAINT leda_payouts_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_payouts
    OWNER to admin;