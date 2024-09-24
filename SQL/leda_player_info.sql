-- Table: public.leda_player_info

-- DROP TABLE IF EXISTS public.leda_player_info;

CREATE TABLE IF NOT EXISTS public.leda_player_info
(
    id bigint NOT NULL,
    "ledaId" bigint,
    "lastName" text COLLATE pg_catalog."default" NOT NULL,
    "firstName" text COLLATE pg_catalog."default" NOT NULL,
    "middleInitial" character varying(1) COLLATE pg_catalog."default" NOT NULL,
    "addressOne" text COLLATE pg_catalog."default" NOT NULL,
    "addressTwo" text COLLATE pg_catalog."default",
    city text COLLATE pg_catalog."default" NOT NULL,
    state text COLLATE pg_catalog."default" NOT NULL,
    zip character varying(9) COLLATE pg_catalog."default" NOT NULL,
    "phoneNumber" text COLLATE pg_catalog."default" NOT NULL,
    "otherNumber" text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default" NOT NULL,
    gender text COLLATE pg_catalog."default" NOT NULL,
    "dateOfBirth" date NOT NULL,
    CONSTRAINT leda_player_info_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_player_info
    OWNER to admin;