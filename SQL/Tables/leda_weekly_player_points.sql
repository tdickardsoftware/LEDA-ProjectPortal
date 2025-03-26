-- Table: public.leda_weekly_player_points

-- DROP TABLE IF EXISTS public.leda_weekly_player_points;

CREATE TABLE IF NOT EXISTS public.leda_weekly_player_points
(
    id bigint NOT NULL DEFAULT nextval('leda_weekly_player_points_seq'::regclass),
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    "ledaId" bigint NOT NULL,
    "prevTotalPoints" bigint NOT NULL DEFAULT 0,
    "totalPoints" bigint NOT NULL,
    CONSTRAINT leda_weekly_player_points_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_weekly_player_points_seasonCode_weekNum_ledaId_key" UNIQUE ("seasonCode", "weekNum", "ledaId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_weekly_player_points
    OWNER to admin;