-- Table: maint.leda_maint_payout_tiers

-- DROP TABLE IF EXISTS maint.leda_maint_payout_tiers;

CREATE TABLE IF NOT EXISTS maint.leda_maint_payout_tiers
(
    id bigint NOT NULL,
    place bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    CONSTRAINT leda_maint_payout_tiers_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS maint.leda_maint_payout_tiers
    OWNER to admin;