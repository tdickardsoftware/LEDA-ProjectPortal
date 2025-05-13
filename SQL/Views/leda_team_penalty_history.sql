-- View: public.leda_team_penalty_history

-- DROP VIEW public.leda_team_penalty_history;

CREATE OR REPLACE VIEW public.leda_team_penalty_history
 AS
 SELECT leda_weekly_scoresheets."seasonCode",
    leda_weekly_scoresheets."weekNum",
    penalties.team_id,
    penalties.penaltycode,
    penalties.points,
    penalties.notes,
    (upper("left"(penalties.divisionname, 1)) || regexp_replace(penalties.subdivisionname, '\D'::text, ''::text, 'g'::text)) || penalties.teamletter AS teamlabel
   FROM leda_weekly_scoresheets,
    LATERAL ( SELECT d1.key AS divisionname,
            d2.key AS subdivisionname,
            tinfo.value ->> 'teamLetter'::text AS teamletter,
            tinfo.key AS team_id,
            pen.value ->> 'penaltyCode'::text AS penaltycode,
            (pen.value ->> 'points'::text)::integer AS points,
            pen.value ->> 'notes'::text AS notes
           FROM json_each(leda_weekly_scoresheets."scoresheetData") d1(key, value),
            LATERAL json_each(d1.value) d2(key, value),
            LATERAL json_each(d2.value) d3(key, value),
            LATERAL json_each(d3.value -> 'teamInformation'::text) tinfo(key, value),
            LATERAL json_each(tinfo.value -> 'penalties'::text) pen(key, value)) penalties;

ALTER TABLE public.leda_team_penalty_history
    OWNER TO admin;