-- Table: public.leda_roster_info

-- DROP TABLE IF EXISTS public.leda_roster_info;

CREATE TABLE IF NOT EXISTS public.leda_roster_info
(
    id bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "teamInfomation" json,
    CONSTRAINT leda_roster_info_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_roster_info
    OWNER to admin;