-- View: public.leda_team_paid_status

-- DROP VIEW public.leda_team_paid_status;

CREATE OR REPLACE VIEW public.leda_team_paid_status
 AS
 SELECT DISTINCT r."seasonCode",
    s."desc",
    s."fiscalYear",
    teams.value ->> 'teamId'::text AS ledaid,
    COALESCE(
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM maint.leda_maint_team_payment_history p
              WHERE p."seasonCode" = r."seasonCode" AND p."ledaId" = ((teams.value ->> 'teamId'::text)::bigint) AND (p.type = 'Memb'::text OR p.type = 'Part'::text AND p."paidOff" = true))) THEN 'PAID'::text
            WHEN (EXISTS ( SELECT 1
               FROM maint.leda_maint_team_payment_history p
              WHERE p."seasonCode" = r."seasonCode" AND p."ledaId" = ((teams.value ->> 'teamId'::text)::bigint) AND p.type = 'Part'::text AND (p."paidOff" = false OR p."paidOff" IS NULL))) THEN 'PART'::text
            ELSE 'UNPAID'::text
        END, 'UNPAID'::text) AS status,
    to_date(s.dates ->> 'Date1'::text, 'MM/DD/YYYY'::text) AS date1
   FROM leda_roster_info r
     JOIN maint.leda_maint_seasons s ON s."seasonCode" = r."seasonCode",
    LATERAL jsonb_each(r."teamInformation"::jsonb) divs(division, divdata),
    LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata),
    LATERAL jsonb_each(subs.subdata) teams(letter, value)
  WHERE teams.value ? 'teamId'::text
  ORDER BY (to_date(s.dates ->> 'Date1'::text, 'MM/DD/YYYY'::text)) DESC;

ALTER TABLE public.leda_team_paid_status
    OWNER TO admin;