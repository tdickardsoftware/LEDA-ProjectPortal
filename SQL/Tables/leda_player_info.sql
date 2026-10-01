-- Table: public.leda_player_info

-- DROP TABLE IF EXISTS public.leda_player_info;

CREATE TABLE IF NOT EXISTS public.leda_player_info
(
    id bigserial NOT NULL,
    "ledaId" bigint,
    "lastName" text COLLATE pg_catalog."default" NOT NULL,
    "firstName" text COLLATE pg_catalog."default" NOT NULL,
    "middleInitial" character varying(1) COLLATE pg_catalog."default",
    "addressOne" text COLLATE pg_catalog."default" NOT NULL,
    "addressTwo" text COLLATE pg_catalog."default",
    city text COLLATE pg_catalog."default" NOT NULL,
    state text COLLATE pg_catalog."default" NOT NULL,
    zip character varying(10) COLLATE pg_catalog."default" NOT NULL,
    "phoneNumber" text COLLATE pg_catalog."default" NOT NULL,
    "otherNumber" text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default" NOT NULL,
    gender text COLLATE pg_catalog."default" NOT NULL,
    "dateOfBirth" date NOT NULL,
    "fullName" text COLLATE pg_catalog."default" NOT NULL,
    nickname text COLLATE pg_catalog."default",
    CONSTRAINT leda_player_info_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_player_info_ledaId_key" UNIQUE ("ledaId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_player_info
    OWNER to admin;
-- Index: idx_leda_player_info_ledaid

-- DROP INDEX IF EXISTS public.idx_leda_player_info_ledaid;

CREATE INDEX IF NOT EXISTS idx_leda_player_info_ledaid
    ON public.leda_player_info USING btree
    ("ledaId" ASC NULLS LAST)
;
-- Index: idx_player_info_covering

-- DROP INDEX IF EXISTS public.idx_player_info_covering;

CREATE INDEX IF NOT EXISTS idx_player_info_covering
    ON public.leda_player_info USING btree
    ("ledaId" ASC NULLS LAST, "lastName" COLLATE pg_catalog."default" ASC NULLS LAST, "firstName" COLLATE pg_catalog."default" ASC NULLS LAST, "middleInitial" COLLATE pg_catalog."default" ASC NULLS LAST, "phoneNumber" COLLATE pg_catalog."default" ASC NULLS LAST)
;