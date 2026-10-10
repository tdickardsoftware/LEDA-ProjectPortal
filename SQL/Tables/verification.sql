-- Table: public.verification

-- DROP TABLE IF EXISTS public.verification;

CREATE TABLE IF NOT EXISTS public.verification
(
    id text COLLATE pg_catalog."default" NOT NULL,
    identifier text COLLATE pg_catalog."default" NOT NULL,
    value text COLLATE pg_catalog."default" NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone,
    CONSTRAINT verification_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.verification
    OWNER to admin;