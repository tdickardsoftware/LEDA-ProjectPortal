-- Table: public.leda_trails_history

-- DROP TABLE IF EXISTS public.leda_trails_history;

CREATE TABLE IF NOT EXISTS public.leda_trails_history
(
    id bigint NOT NULL,
    "ledaPlayerId" bigint NOT NULL,
    "notes" text COLLATE pg_catalog."default",
    "singlesPlace" bigint NOT NULL,
    "doublesPlace" bigint NOT NULL,
    "trailsPoints" bigint NOT NULL,
    "trailsDate" date NOT NULL,
    CONSTRAINT leda_trails_history_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_trails_history
    OWNER to admin;