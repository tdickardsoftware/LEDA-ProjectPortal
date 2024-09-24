-- Table: public.leda_team_info

-- DROP TABLE IF EXISTS public.leda_team_info;

CREATE TABLE IF NOT EXISTS public.leda_team_info
(
    id bigint NOT NULL,
    "ledaId" bigint,
    "teamName" text COLLATE pg_catalog."default" NOT NULL,
    "establishedDate" date NOT NULL,
    "memo" text COLLATE pg_catalog."default",
    "lastTeamFeePayment" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_team_info_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_team_info
    OWNER to admin;