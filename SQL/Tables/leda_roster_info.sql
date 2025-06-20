-- Table: public.leda_roster_info

-- DROP TABLE IF EXISTS public.leda_roster_info;

CREATE TABLE IF NOT EXISTS public.leda_roster_info
(
    id bigint NOT NULL DEFAULT nextval('leda_roster_info_seq'::regclass),
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "teamInformation" json,
    CONSTRAINT leda_roster_info_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_roster_info_seasonCode_key" UNIQUE ("seasonCode")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_roster_info
    OWNER to admin;