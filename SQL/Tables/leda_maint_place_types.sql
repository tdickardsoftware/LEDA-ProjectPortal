-- Table: maint.leda_maint_place_types

-- DROP TABLE IF EXISTS maint.leda_maint_place_types;

CREATE TABLE IF NOT EXISTS maint.leda_maint_place_types
(
    id bigint NOT NULL,
    "placeTypeCode" text COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    CONSTRAINT leda_maint_place_types_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_place_types
    OWNER to admin;