-- View: public.leda_player_team_info

-- DROP VIEW public.leda_player_team_info;

CREATE OR REPLACE VIEW public.leda_player_team_info
 AS
 SELECT t."ledaId" AS "teamLedaId",
    member.value ->> 'ledaId'::text AS "ledaId",
    (member.value ->> 'isCaptain'::text)::boolean AS "isCaptain",
    concat(COALESCE(p."firstName", ''::text), ' ', COALESCE(p."middleInitial", ''::character varying), ' ', COALESCE(p."lastName", ''::text)) AS "fullName",
    m."cannotBeCaptain",
    m."badStanding"
   FROM leda_team_info t,
    LATERAL json_each(t."memberIdList") member(key, value)
     LEFT JOIN leda_player_info p ON p."ledaId" = ((member.value ->> 'ledaId'::text)::integer)
     LEFT JOIN leda_membership_info m ON m."ledaId" = ((member.value ->> 'ledaId'::text)::integer);

ALTER TABLE public.leda_player_team_info
    OWNER TO admin;