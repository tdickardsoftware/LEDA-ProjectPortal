-- View: public.leda_team_penalty_history

-- DROP VIEW public.leda_team_penalty_history;

CREATE OR REPLACE VIEW public.leda_team_penalty_history
 AS
 SELECT t."seasonCode",
    t."weekNum",
    t."teamId" AS team_id,
    pen.key AS penaltycode,
    (pen.value ->> 'points'::text)::integer AS points,
    pen.value ->> 'notes'::text AS notes,
    (upper("left"(t.division, 1)) || regexp_replace(t.subdivision, '\D'::text, ''::text, 'g'::text)) || t."teamLetter"::text AS teamlabel
   FROM leda_weekly_scoresheets_team_info t
     CROSS JOIN LATERAL jsonb_each(t.penalties) pen(key, value);

ALTER TABLE public.leda_team_penalty_history
    OWNER TO admin;

