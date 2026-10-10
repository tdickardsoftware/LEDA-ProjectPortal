-- Table: maint.leda_maint_player_payment_history

-- DROP TABLE IF EXISTS maint.leda_maint_player_payment_history;

CREATE TABLE IF NOT EXISTS maint.leda_maint_player_payment_history
(
    id bigint NOT NULL DEFAULT nextval('maint.leda_player_payment_history_seq'::regclass),
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
    CONSTRAINT leda_maint_player_payment_history_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_maint_player_payment_history_paymentNbr_key" UNIQUE ("paymentNbr")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_player_payment_history
    OWNER to admin;
-- Index: idx_player_payment_history_main

-- DROP INDEX IF EXISTS maint.idx_player_payment_history_main;

CREATE INDEX IF NOT EXISTS idx_player_payment_history_main
    ON maint.leda_maint_player_payment_history USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, type COLLATE pg_catalog."default" ASC NULLS LAST, "paidOff" ASC NULLS LAST)
;
-- Index: idx_player_payment_history_season_leda_type_paidoff

-- DROP INDEX IF EXISTS maint.idx_player_payment_history_season_leda_type_paidoff;

CREATE INDEX IF NOT EXISTS idx_player_payment_history_season_leda_type_paidoff
    ON maint.leda_maint_player_payment_history USING btree
    ("seasonCode" COLLATE pg_catalog."default" ASC NULLS LAST, "ledaId" ASC NULLS LAST, type COLLATE pg_catalog."default" ASC NULLS LAST, "paidOff" ASC NULLS LAST)
;