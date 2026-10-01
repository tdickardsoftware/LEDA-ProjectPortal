-- Table: public.leda_player_mention_history

-- DROP TABLE IF EXISTS public.leda_player_mention_history;

CREATE TABLE IF NOT EXISTS public.leda_player_mention_history
(
    id bigserial NOT NULL,
    "ledaId" bigint NOT NULL,
    "mentionCode" text COLLATE pg_catalog."default" NOT NULL,
    "mentionDesc" text COLLATE pg_catalog."default",
    "mentionPoints" bigint NOT NULL,
    "seasonCode" text COLLATE pg_catalog."default" NOT NULL,
    "weekNum" bigint NOT NULL,
    notes text COLLATE pg_catalog."default",
    "creationDate" date NOT NULL,
    "mentionId" bigint NOT NULL,
    count bigint NOT NULL DEFAULT 0,
    "teamId" bigint NOT NULL,
    CONSTRAINT leda_player_mention_history_pkey PRIMARY KEY (id),
    CONSTRAINT "leda_player_mention_history_ledaId_seasonCode_weekNum_teamI_key" UNIQUE ("ledaId", "seasonCode", "weekNum", "teamId", "mentionId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leda_player_mention_history
    OWNER to admin;