-- SEQUENCE: public.leda_schedule_seq

-- DROP SEQUENCE IF EXISTS public.leda_schedule_seq;

CREATE SEQUENCE IF NOT EXISTS public.leda_schedule_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.leda_schedule_seq
    OWNED BY public.leda_schedule.id;

ALTER SEQUENCE public.leda_schedule_seq
    OWNER TO admin;