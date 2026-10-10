-- Table: public.leda_payouts

-- DROP TABLE IF EXISTS public.leda_payouts;

CREATE TABLE IF NOT EXISTS public.leda_payouts
(
    id bigserial NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "payoutsData" jsonb NOT NULL,
    CONSTRAINT leda_payouts_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_payouts_seasonCode_key" UNIQUE ("seasonCode")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_payouts
    OWNER to admin;
-- Index: idx_leda_payouts_data_gin

-- DROP INDEX IF EXISTS public.idx_leda_payouts_data_gin;

CREATE INDEX IF NOT EXISTS idx_leda_payouts_data_gin
    ON public.leda_payouts USING gin
    ("payoutsData")
;
-- Index: leda_payouts_seasonCode_idx

-- DROP INDEX IF EXISTS public."leda_payouts_seasonCode_idx";

CREATE INDEX IF NOT EXISTS "leda_payouts_seasonCode_idx"
    ON public.leda_payouts USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (deduplicate_items=True)
;