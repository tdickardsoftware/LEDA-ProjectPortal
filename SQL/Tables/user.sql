-- Table: public.user

-- DROP TABLE IF EXISTS public."user";

CREATE TABLE IF NOT EXISTS public."user"
(
    id text COLLATE pg_catalog."default" NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL,
    role text COLLATE pg_catalog."default" NOT NULL DEFAULT USER,
    username text COLLATE pg_catalog."default" NOT NULL,
    "displayUsername" text COLLATE pg_catalog."default",
    "mustResetPassword" boolean DEFAULT false,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT user_email_key UNIQUE (email),
    CONSTRAINT user_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."user"
    OWNER to admin;