-- View: public.leda_player_paid_status

-- DROP VIEW public.leda_player_paid_status;

CREATE OR REPLACE VIEW public.leda_player_paid_status
 AS
 SELECT DISTINCT r."seasonCode",
    s."desc",
    s."fiscalYear",
    player.playervalue ->> 'ledaId'::text AS playerid,
    COALESCE(
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM maint.leda_maint_player_payment_history p
              WHERE p."seasonCode" = r."seasonCode" AND p."ledaId" = ((player.playervalue ->> 'ledaId'::text)::bigint) AND (p.type = 'Memb'::text OR p.type = 'Part'::text AND p."paidOff" = true))) THEN 'PAID'::text
            WHEN (EXISTS ( SELECT 1
               FROM maint.leda_maint_player_payment_history p
              WHERE p."seasonCode" = r."seasonCode" AND p."ledaId" = ((player.playervalue ->> 'ledaId'::text)::bigint) AND p.type = 'Part'::text AND (p."paidOff" = false OR p."paidOff" IS NULL))) THEN 'PART'::text
            ELSE 'UNPAID'::text
        END, 'UNPAID'::text) AS status,
    to_date(s.dates ->> 'Date1'::text, 'MM/DD/YYYY'::text) AS date1
   FROM leda_roster_info r
     JOIN maint.leda_maint_seasons s ON s."seasonCode" = r."seasonCode",
    LATERAL jsonb_each(r."teamInformation"::jsonb) divs(division, divdata),
    LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata),
    LATERAL jsonb_each(subs.subdata) teams(letter, value)
     JOIN leda_team_info t ON t."ledaId" = ((teams.value ->> 'teamId'::text)::bigint),
    LATERAL jsonb_each(t."memberIdList"::jsonb) player(playerkey, playervalue)
  WHERE teams.value ? 'teamId'::text AND player.playervalue ? 'ledaId'::text
  ORDER BY (to_date(s.dates ->> 'Date1'::text, 'MM/DD/YYYY'::text)) DESC;

ALTER TABLE public.leda_player_paid_status
    OWNER TO admin;