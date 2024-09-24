-- Table: public.leda_team_member_history

-- DROP TABLE IF EXISTS public.leda_team_member_history;

CREATE TABLE IF NOT EXISTS public.leda_team_member_history
(
    "id" bigint NOT NULL,
    "ledaTeamId" bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "memberIdList" text COLLATE pg_catalog."default" NOT NULL,
    "captainId" bigint NOT NULL,
    "barId" bigint NOT NULL,
    "division" text COLLATE pg_catalog."default" NOT NULL,
    "subdivision" bigint NOT NULL,
    "teamLetter" character varying(1) COLLATE pg_catalog."default" NOT NULL,
    "notes" text COLLATE pg_catalog."default",
    "finalStandings" bigint,
    "teamPaid" boolean NOT NULL,
    "barPaid" boolean NOT NULL,
    CONSTRAINT leda_team_member_history_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_team_member_history
    OWNER to admin;