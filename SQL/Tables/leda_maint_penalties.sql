-- Table: maint.leda_maint_penalties

-- DROP TABLE IF EXISTS maint.leda_maint_penalties;

CREATE TABLE IF NOT EXISTS maint.leda_maint_penalties
(
    id bigint NOT NULL,
    "penaltyCode" text COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    CONSTRAINT leda_maint_penalties_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_penalties
    OWNER to admin;