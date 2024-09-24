-- Table: maint.leda_maint_divisions

-- DROP TABLE IF EXISTS maint.leda_maint_divisions;

CREATE TABLE IF NOT EXISTS maint.leda_maint_divisions
(
    id bigint NOT NULL,
    "divisionName" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_maint_divisions_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_divisions
    OWNER to admin;