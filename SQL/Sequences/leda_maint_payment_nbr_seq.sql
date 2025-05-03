-- SEQUENCE: maint.leda_maint_payment_nbr_seq

-- DROP SEQUENCE IF EXISTS maint.leda_maint_payment_nbr_seq;

CREATE SEQUENCE IF NOT EXISTS maint.leda_maint_payment_nbr_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE maint.leda_maint_payment_nbr_seq
    OWNER TO admin;