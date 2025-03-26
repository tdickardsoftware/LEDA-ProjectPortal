-- Table: public.leda_weekly_scoresheets

-- DROP TABLE IF EXISTS public.leda_weekly_scoresheets;

CREATE TABLE IF NOT EXISTS public.leda_weekly_scoresheets
(
    id bigint NOT NULL DEFAULT nextval('leda_weekly_scoresheets_seq'::regclass),
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    "scoreSheetData" json NOT NULL,
    CONSTRAINT leda_weekly_scoresheets_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_weekly_scoresheets_seasonCode_key" UNIQUE ("seasonCode")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_scoresheets
    OWNER to admin;