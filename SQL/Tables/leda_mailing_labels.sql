-- Table: public.leda_mailing_labels

-- DROP TABLE IF EXISTS public.leda_mailing_labels;

CREATE TABLE IF NOT EXISTS public.leda_mailing_labels
(
    id bigserial NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    "addressLineOne" text COLLATE pg_catalog."default",
    "addressLineTwo" text COLLATE pg_catalog."default",
    "ledaId" bigint NOT NULL,
    type text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_mailing_labels_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_mailing_labels_name_addressLineOne_addressLineTwo_leda_key" UNIQUE (name, "addressLineOne", "addressLineTwo", "ledaId", type)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_mailing_labels
    OWNER to admin;