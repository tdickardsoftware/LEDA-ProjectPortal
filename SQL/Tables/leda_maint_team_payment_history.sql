-- Table: maint.leda_maint_team_payment_history

-- DROP TABLE IF EXISTS maint.leda_maint_team_payment_history;

CREATE TABLE IF NOT EXISTS maint.leda_maint_team_payment_history
(
    id bigint NOT NULL DEFAULT nextval('maint.leda_team_payment_history_seq'::regclass),
    "ledaId" bigint NOT NULL,
    type text COLLATE pg_catalog."default" NOT NULL,
    "paymentType" text COLLATE pg_catalog."default" NOT NULL,
    amount money NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    comp boolean NOT NULL DEFAULT false,
    notes text COLLATE pg_catalog."default",
    "paidOff" boolean NOT NULL DEFAULT false,
    date date NOT NULL DEFAULT CURRENT_DATE,
    "paymentNbr" bigint NOT NULL DEFAULT nextval('maint.leda_maint_payment_nbr_seq'::regclass),
    CONSTRAINT leda_maint_team_payment_history_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_maint_team_payment_history_paymentNbr_key" UNIQUE ("paymentNbr")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_team_payment_history
    OWNER to admin;
-- Index: leda_maint_team_payment_histo_ledaId_ledaId1_type_seasonCod_idx

-- DROP INDEX IF EXISTS maint."leda_maint_team_payment_histo_ledaId_ledaId1_type_seasonCod_idx";

CREATE INDEX IF NOT EXISTS "leda_maint_team_payment_histo_ledaId_ledaId1_type_seasonCod_idx"
    ON maint.leda_maint_team_payment_history USING btree
    ("ledaId" ASC NULLS LAST)
    INCLUDE("ledaId", type, "seasonCode", "paidOff")
    WITH (deduplicate_items=True)
;
-- Index: leda_maint_team_payment_history_ledaId_idx

-- DROP INDEX IF EXISTS maint."leda_maint_team_payment_history_ledaId_idx";

CREATE INDEX IF NOT EXISTS "leda_maint_team_payment_history_ledaId_idx"
    ON maint.leda_maint_team_payment_history USING btree
    ("ledaId" ASC NULLS LAST)
    WITH (deduplicate_items=True)
;
-- Index: leda_maint_team_payment_history_ledaId_seasonCode_type_idx

-- DROP INDEX IF EXISTS maint."leda_maint_team_payment_history_ledaId_seasonCode_type_idx";

CREATE INDEX IF NOT EXISTS "leda_maint_team_payment_history_ledaId_seasonCode_type_idx"
    ON maint.leda_maint_team_payment_history USING btree
    ("ledaId" ASC NULLS LAST)
    INCLUDE("seasonCode", type)
    WITH (deduplicate_items=True)
;