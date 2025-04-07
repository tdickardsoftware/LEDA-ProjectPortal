-- Table: public.leda_trails_point_totals_audit

-- DROP TABLE IF EXISTS public.leda_trails_point_totals_audit;

CREATE TABLE IF NOT EXISTS public.leda_trails_point_totals_audit
(
    id bigint NOT NULL DEFAULT nextval('leda_trails_point_totals_audit_seq'::regclass),
    "ledaId" bigint NOT NULL,
    "modifyDate" timestamp without time zone NOT NULL,
    "previousTotalPoints" bigint NOT NULL,
    "totalPoints" bigint NOT NULL,
    "changeBy" bigint NOT NULL,
    "trailsDate" date NOT NULL,
    CONSTRAINT leda_trails_totals_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_trails_point_totals_audit
    OWNER to admin;