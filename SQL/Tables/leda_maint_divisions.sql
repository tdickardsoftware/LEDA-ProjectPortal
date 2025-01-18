-- Table: maint.leda_maint_divisions

-- DROP TABLE IF EXISTS maint.leda_maint_divisions;

CREATE TABLE IF NOT EXISTS maint.leda_maint_divisions
(
    id bigint NOT NULL DEFAULT nextval('maint.leda_maint_divisions_seq'::regclass),
    "divisionName" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_maint_divisions_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_maint_divisions_divisionName_key" UNIQUE ("divisionName")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_divisions
    OWNER to admin;