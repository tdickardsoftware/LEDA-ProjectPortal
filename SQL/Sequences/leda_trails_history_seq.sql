-- SEQUENCE: public.leda_trails_history_seq

-- DROP SEQUENCE IF EXISTS public.leda_trails_history_seq;

CREATE SEQUENCE IF NOT EXISTS public.leda_trails_history_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.leda_trails_history_seq
    OWNED BY public.leda_trails_history.id;

ALTER SEQUENCE public.leda_trails_history_seq
    OWNER TO admin;