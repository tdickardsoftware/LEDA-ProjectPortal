-- SEQUENCE: public.leda_weekly_score_seq

-- DROP SEQUENCE IF EXISTS public.leda_weekly_score_seq;

CREATE SEQUENCE IF NOT EXISTS public.leda_weekly_score_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.leda_weekly_score_seq
    OWNED BY public.leda_weekly_score.id;

ALTER SEQUENCE public.leda_weekly_score_seq
    OWNER TO admin;