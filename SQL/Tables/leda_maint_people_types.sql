-- Table: maint.leda_maint_people_types

-- DROP TABLE IF EXISTS maint.leda_maint_people_types;

CREATE TABLE IF NOT EXISTS maint.leda_maint_people_types
(
    id bigint NOT NULL DEFAULT nextval('maint.leda_maint_people_types_seq'::regclass),
    "peopleTypeCode" text COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    CONSTRAINT leda_maint_people_types_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_maint_people_types_peopleTypeCode_key" UNIQUE ("peopleTypeCode")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_people_types
    OWNER to admin;