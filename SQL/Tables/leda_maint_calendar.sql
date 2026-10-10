-- Table: maint.leda_maint_calendar

-- DROP TABLE IF EXISTS maint.leda_maint_calendar;

CREATE TABLE IF NOT EXISTS maint.leda_maint_calendar
(
    date date NOT NULL,
    "desc" text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_calendar
    OWNER to admin;