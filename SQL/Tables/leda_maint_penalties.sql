-- Table: maint.leda_maint_penalties

-- DROP TABLE IF EXISTS maint.leda_maint_penalties;

CREATE TABLE IF NOT EXISTS maint.leda_maint_penalties
(
    id bigint NOT NULL DEFAULT nextval('maint.leda_maint_penalties_seq'::regclass),
    "penaltyCode" text COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    CONSTRAINT leda_maint_penalties_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_maint_penalties_penaltyCode_key" UNIQUE ("penaltyCode")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_penalties
    OWNER to admin;