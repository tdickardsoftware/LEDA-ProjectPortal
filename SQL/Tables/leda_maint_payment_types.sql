-- Table: maint.leda_maint_payment_types

-- DROP TABLE IF EXISTS maint.leda_maint_payment_types;

CREATE TABLE IF NOT EXISTS maint.leda_maint_payment_types
(
    id bigint NOT NULL,
    "paymentType" text COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    CONSTRAINT leda_maint_payment_types_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_payment_types
    OWNER to admin;