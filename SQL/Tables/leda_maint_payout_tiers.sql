-- Table: maint.leda_maint_payout_tiers

-- DROP TABLE IF EXISTS maint.leda_maint_payout_tiers;

CREATE TABLE IF NOT EXISTS maint.leda_maint_payout_tiers
(
    id bigint NOT NULL DEFAULT nextval('maint.leda_maint_payout_tiers_seq'::regclass),
    "place" bigint NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    CONSTRAINT leda_maint_payout_tiers_pkey PRIMARY KEY (id)
    CONSTRAINT leda_maint_payout_tiers_place_unique UNIQUE (place)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_payout_tiers
    OWNER to admin;