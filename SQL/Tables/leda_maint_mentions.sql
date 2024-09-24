-- Table: maint.leda_maint_mentions

-- DROP TABLE IF EXISTS maint.leda_maint_mentions;

CREATE TABLE IF NOT EXISTS maint.leda_maint_mentions
(
    id bigint NOT NULL,
    "mentionCode" text COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    "points" bigint NOT NULL,
    "mentionBasis" text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT leda_maint_mentions_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_mentions
    OWNER to admin;