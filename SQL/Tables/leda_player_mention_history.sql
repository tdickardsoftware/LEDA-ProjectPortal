-- Table: public.leda_player_mention_history

-- DROP TABLE IF EXISTS public.leda_player_mention_history;

CREATE TABLE IF NOT EXISTS public.leda_player_mention_history
(
    id bigint NOT NULL DEFAULT nextval('leda_player_mention_history_seq'::regclass),
    "ledaId" bigint NOT NULL,
    "mentionCode" bigint NOT NULL,
    "mentionDesc" text COLLATE pg_catalog."default",
    "mentionPoints" bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    notes text COLLATE pg_catalog."default",
    "creationDate" date NOT NULL,
    CONSTRAINT leda_player_mention_history_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_player_mention_history
    OWNER to admin;