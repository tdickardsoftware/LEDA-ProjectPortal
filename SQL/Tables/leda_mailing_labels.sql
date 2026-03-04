-- Table: public.leda_mailing_labels

-- DROP TABLE IF EXISTS public.leda_mailing_labels;

CREATE TABLE IF NOT EXISTS public.leda_mailing_labels
(
    id bigint NOT NULL DEFAULT nextval('leda_mailing_labels_seq'::regclass),
    name text COLLATE pg_catalog."default" NOT NULL,
    "addressLineOne" text COLLATE pg_catalog."default",
    "addressLineTwo" text COLLATE pg_catalog."default",
    "addressLineThree" text COLLATE pg_catalog."default",
    CONSTRAINT leda_mailing_labels_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_mailing_labels
    OWNER to admin;