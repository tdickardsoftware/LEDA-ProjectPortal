-- Table: public.leda_schedule_team_info

-- DROP TABLE IF EXISTS public.leda_schedule_team_info;

CREATE TABLE IF NOT EXISTS public.leda_schedule_team_info
(
    id bigint NOT NULL,
    "rosterId" bigint NOT NULL,
    "teamId" bigint NOT NULL,
    "weekNum" bigint NOT NULL,
    "home" boolean NOT NULL,
    "oppTeamId" bigint NOT NULL,
    "matchDateTime" timestamp without time zone NOT NULL,
    CONSTRAINT leda_schedule_team_info_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_schedule_team_info
    OWNER to admin;