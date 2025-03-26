-- SEQUENCE: public.leda_weekly_player_points_seq

-- DROP SEQUENCE IF EXISTS public.leda_weekly_player_points_seq;

CREATE SEQUENCE IF NOT EXISTS public.leda_weekly_player_points_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.leda_weekly_player_points_seq
    OWNED BY public.leda_weekly_player_points.id;

ALTER SEQUENCE public.leda_weekly_player_points_seq
    OWNER TO admin;