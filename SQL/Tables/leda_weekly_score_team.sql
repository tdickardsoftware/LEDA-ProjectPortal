-- Table: public.leda_weekly_score_teams

-- DROP TABLE IF EXISTS public.leda_weekly_score_teams;

CREATE TABLE IF NOT EXISTS public.leda_weekly_score_teams
(
    id bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "ledaTeamId" bigint NOT NULL,
    "weekNum" bigint NOT NULL,
    "wonGameInformation" json NOT NULL,
    "pointsGameInformation" json NOT NULL,
    "homeScore" bigint NOT NULL,
    "awayScore" bigint NOT NULL,
    "paidWeeklyFees" boolean NOT NULL,
    CONSTRAINT leda_weekly_score_teams_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_score_teams
    OWNER to admin;