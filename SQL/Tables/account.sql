-- Table: public.account

-- DROP TABLE IF EXISTS public.account;

CREATE TABLE IF NOT EXISTS public.account
(
    id text COLLATE pg_catalog."default" NOT NULL,
    "accountId" text COLLATE pg_catalog."default" NOT NULL,
    "providerId" text COLLATE pg_catalog."default" NOT NULL,
    "userId" text COLLATE pg_catalog."default" NOT NULL,
    "accessToken" text COLLATE pg_catalog."default",
    "refreshToken" text COLLATE pg_catalog."default",
    "idToken" text COLLATE pg_catalog."default",
    "accessTokenExpiresAt" timestamp without time zone,
    "refreshTokenExpiresAt" timestamp without time zone,
    scope text COLLATE pg_catalog."default",
    password text COLLATE pg_catalog."default",
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL,
    CONSTRAINT account_pkey PRIMARY KEY (id),
    CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.account
    OWNER to admin;