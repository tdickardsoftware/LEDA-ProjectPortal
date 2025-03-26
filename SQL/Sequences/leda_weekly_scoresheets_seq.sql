-- SEQUENCE: public.leda_weekly_scoresheets_seq

-- DROP SEQUENCE IF EXISTS public.leda_weekly_scoresheets_seq;

CREATE SEQUENCE IF NOT EXISTS public.leda_weekly_scoresheets_seq
    INCREMENT 1
    START 1
    MINVALUE 0
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.leda_weekly_scoresheets_seq
    OWNED BY public.leda_weekly_scoresheets.id;

ALTER SEQUENCE public.leda_weekly_scoresheets_seq
    OWNER TO admin;