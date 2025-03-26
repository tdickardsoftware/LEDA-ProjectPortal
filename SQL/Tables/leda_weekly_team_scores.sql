-- Table: public.leda_weekly_team_scores

-- DROP TABLE IF EXISTS public.leda_weekly_team_scores;

CREATE TABLE IF NOT EXISTS public.leda_weekly_team_scores
(
    id bigint NOT NULL DEFAULT nextval('leda_weekly_team_scores_seq'::regclass),
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    "teamLedaId" bigint NOT NULL,
    "prevTotalPoints" bigint NOT NULL DEFAULT 0,
    "totalPoints" bigint NOT NULL,
    CONSTRAINT leda_weekly_team_scores_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_team_scores
    OWNER to admin;