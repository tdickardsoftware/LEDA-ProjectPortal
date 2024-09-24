-- Table: public.leda_weekly_score

-- DROP TABLE IF EXISTS public.leda_weekly_score;

CREATE TABLE IF NOT EXISTS public.leda_weekly_score
(
    id bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "ledaPlayerId" bigint NOT NULL,
    "weekNum" bigint NOT NULL,
    "gameInformation" json NOT NULL,
    CONSTRAINT leda_weekly_score_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_score
    OWNER to admin;