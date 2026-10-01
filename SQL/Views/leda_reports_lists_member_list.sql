-- View: public.leda_reports_lists_member_list

-- DROP VIEW public.leda_reports_lists_member_list;

CREATE OR REPLACE VIEW public.leda_reports_lists_member_list
 AS
 SELECT r."seasonCode",
    player.playervalue ->> 'ledaId'::text AS "playerId",
    concat(COALESCE(lpi."lastName", ''::text), ', ', COALESCE(lpi."firstName", ''::text), ' ', COALESCE(lpi."middleInitial", ''::character varying)) AS "fullName",
    concat(SUBSTRING(lpi."phoneNumber" FROM 1 FOR 3), '-', SUBSTRING(lpi."phoneNumber" FROM 4 FOR 3), '-', SUBSTRING(lpi."phoneNumber" FROM 7 FOR 4)) AS "phoneNumber",
    lpi.email,
    lpi."addressOne",
    lpi."addressTwo",
    lpi.city,
    lpi.state,
    lpi.zip,
    ("left"(divs.division, 1) || regexp_replace(subs.subdivision, '[^0-9]'::text, ''::text, 'g'::text)) || teams.letter AS "divisionInfo",
    divs.division,
    lmi."establishedDate",
    lmi."lifetimeMember",
    lmi."badStanding",
    regexp_replace(subs.subdivision, '[^0-9]'::text, ''::text, 'g'::text) AS subdivision
   FROM leda_roster_info r
     LEFT JOIN LATERAL jsonb_each(r."teamInformation") divs(division, divdata) ON true
     LEFT JOIN LATERAL jsonb_each(divs.divdata -> 'subdivisions'::text) subs(subdivision, subdata) ON true
     LEFT JOIN LATERAL jsonb_each(subs.subdata) teams(letter, value) ON true
     LEFT JOIN leda_team_info ti ON ti."ledaId" = ((teams.value ->> 'teamId'::text)::bigint)
     LEFT JOIN LATERAL jsonb_each(ti."memberIdList") player(playerkey, playervalue) ON true
     LEFT JOIN leda_player_info lpi ON ((player.playervalue ->> 'ledaId'::text)::bigint) = lpi."ledaId"
     LEFT JOIN leda_membership_info lmi ON ((player.playervalue ->> 'ledaId'::text)::bigint) = lmi."ledaId";

ALTER TABLE public.leda_reports_lists_member_list
    OWNER TO admin;

