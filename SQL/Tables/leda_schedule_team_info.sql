-- Table: public.leda_schedule_team_info

-- DROP TABLE IF EXISTS public.leda_schedule_team_info;

CREATE TABLE IF NOT EXISTS public.leda_schedule_team_info
(
    id bigint NOT NULL,
    "teamId" bigint NOT NULL,
    "teamLetter" text COLLATE pg_catalog."default" NOT NULL,
    "teamMatchData" json NOT NULL,
    CONSTRAINT leda_schedule_team_info_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_schedule_team_info
    OWNER to admin;