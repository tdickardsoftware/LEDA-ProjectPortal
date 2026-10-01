-- Table: public.leda_temp_player_info

-- DROP TABLE IF EXISTS public.leda_temp_player_info;

CREATE TABLE IF NOT EXISTS public.leda_temp_player_info
(
    "firstName" text COLLATE pg_catalog."default" NOT NULL,
    "middleInitial" character varying(1) COLLATE pg_catalog."default",
    "lastName" text COLLATE pg_catalog."default" NOT NULL,
    "tempId" bigint NOT NULL,
    CONSTRAINT leda_temp_player_info_pkey PRIMARY KEY ("tempId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_temp_player_info
    OWNER to admin;