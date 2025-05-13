-- SEQUENCE: maint.leda_player_payment_history_seq

-- DROP SEQUENCE IF EXISTS maint.leda_player_payment_history_seq;

CREATE SEQUENCE IF NOT EXISTS maint.leda_player_payment_history_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE maint.leda_player_payment_history_seq
    OWNER TO admin;