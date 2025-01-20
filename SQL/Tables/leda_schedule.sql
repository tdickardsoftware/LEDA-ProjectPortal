-- Table: public.leda_schedule

-- DROP TABLE IF EXISTS public.leda_schedule;

CREATE TABLE IF NOT EXISTS public.leda_schedule
(
    id bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "rosterId" bigint NOT NULL,
    CONSTRAINT leda_schedule_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_schedule
    OWNER to admin;