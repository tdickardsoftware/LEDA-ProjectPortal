-- Table: public.leda_place_info

-- DROP TABLE IF EXISTS public.leda_place_info;

CREATE TABLE IF NOT EXISTS public.leda_place_info
(
    "id" bigint NOT NULL,
    "ledaId" bigint,
    "name" text COLLATE pg_catalog."default" NOT NULL,
    "addressOne" text COLLATE pg_catalog."default" NOT NULL,
    "addressTwo" text COLLATE pg_catalog."default",
    "city" text COLLATE pg_catalog."default" NOT NULL,
    "state" text COLLATE pg_catalog."default" NOT NULL,
    "zip" character varying(10) COLLATE pg_catalog."default" NOT NULL,
    "phoneNumber" text COLLATE pg_catalog."default" NOT NULL,
    "otherPhoneNumber" text COLLATE pg_catalog."default",
    "email" text COLLATE pg_catalog."default",
    "website" text COLLATE pg_catalog."default",
    "establishDate" date NOT NULL,
    "memo" text COLLATE pg_catalog."default",
    "numberOfBoards" bigint NOT NULL,
    "sendMailings" boolean NOT NULL,
    "regularSponsor" boolean NOT NULL,
    "currentSponsor" boolean NOT NULL,
    "issues" boolean NOT NULL,
    "lastBarFeePayment" text COLLATE pg_catalog."default" NOT NULL,
    "lastSanctioningDate" date NOT NULL,
    "contactId" bigint NOT NULL,
    "placeType" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_place_info_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_place_info
    OWNER to admin;