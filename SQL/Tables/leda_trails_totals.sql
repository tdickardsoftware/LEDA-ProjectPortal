-- Table: public.leda_trails_totals

-- DROP TABLE IF EXISTS public.leda_trails_totals;

CREATE TABLE IF NOT EXISTS public.leda_trails_totals
(
    id bigint NOT NULL,
    "ledaPlayerId" bigint NOT NULL,
    "previousTotalPoints" bigint NOT NULL,
    "totalPoints" bigint NOT NULL,
    CONSTRAINT leda_trails_totals_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_trails_totals
    OWNER to admin;