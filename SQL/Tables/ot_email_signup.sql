-- Table: public.ot_email_signup

-- DROP TABLE IF EXISTS public.ot_email_signup;

CREATE TABLE IF NOT EXISTS public.ot_email_signup
(
    email text COLLATE pg_catalog."default" NOT NULL,
    token text COLLATE pg_catalog."default" NOT NULL,
    "creationDateTime" timestamp without time zone NOT NULL,
    "expirationDateTime" timestamp without time zone NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.ot_email_signup
    OWNER to admin;