-- Table: public.leda_place_info

-- DROP TABLE IF EXISTS public.leda_place_info;

CREATE TABLE IF NOT EXISTS public.leda_place_info
(
    id bigserial NOT NULL,
    "ledaId" bigint,
    name text COLLATE pg_catalog."default" NOT NULL,
    "addressOne" text COLLATE pg_catalog."default" NOT NULL,
    "addressTwo" text COLLATE pg_catalog."default",
    city text COLLATE pg_catalog."default" NOT NULL,
    state text COLLATE pg_catalog."default" NOT NULL,
    zip character varying(10) COLLATE pg_catalog."default" NOT NULL,
    "phoneNumber" text COLLATE pg_catalog."default" NOT NULL,
    "otherNumber" text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    website text COLLATE pg_catalog."default",
    "establishDate" date NOT NULL,
    memo text COLLATE pg_catalog."default",
    "numberOfBoards" bigint NOT NULL,
    "sendMailings" boolean NOT NULL,
    "regularSponsor" boolean NOT NULL,
    "currentSponsor" boolean NOT NULL,
    issues boolean NOT NULL,
    "lastBarFeePayment" text COLLATE pg_catalog."default" NOT NULL,
    "lastSanctioningDate" date,
    "contactId" bigint NOT NULL,
    "placeType" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_place_info_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_place_info_ledaId_key" UNIQUE ("ledaId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_place_info
    OWNER to admin;
-- Index: leda_place_info_ledaId_idx

-- DROP INDEX IF EXISTS public."leda_place_info_ledaId_idx";

CREATE INDEX IF NOT EXISTS "leda_place_info_ledaId_idx"
    ON public.leda_place_info USING btree
    ("ledaId" ASC NULLS LAST)
    WITH (deduplicate_items=True)
;