-- Table: public.rateLimit

-- DROP TABLE IF EXISTS public."rateLimit";

CREATE TABLE IF NOT EXISTS public."rateLimit"
(
    id text COLLATE pg_catalog."default" NOT NULL,
    key text COLLATE pg_catalog."default" NOT NULL,
    count integer NOT NULL,
    "lastRequest" bigint NOT NULL,
    CONSTRAINT "rateLimit_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."rateLimit"
    OWNER to admin;