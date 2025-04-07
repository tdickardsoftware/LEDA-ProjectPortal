CREATE TABLE IF NOT EXISTS public.leda_payouts
(
    id bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "payoutsData" json NOT NULL,
    CONSTRAINT leda_payouts_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_payouts_seasonCode_key" UNIQUE ("seasonCode")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_payouts
    OWNER to admin;