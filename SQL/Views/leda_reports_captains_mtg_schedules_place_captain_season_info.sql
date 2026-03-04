 SELECT info."seasonCode",
    s."desc",
    info.teamid as "teamId",
    info.placeid as "placeId",
    p.name AS "placeName",
    TRIM(BOTH FROM COALESCE(p."addressOne", ''::text) ||
        CASE
            WHEN p."addressTwo" IS NOT NULL AND p."addressTwo" <> ''::text THEN ' '::text || p."addressTwo"
            ELSE ''::text
        END) AS "addressFirstLine",
    (((COALESCE(p.city, ''::text) || ', '::text) || COALESCE(p.state, ''::text)) || ' '::text) || COALESCE(p.zip, ''::character varying)::text AS "addressSecondLine",
        CASE
            WHEN p."phoneNumber" ~ '^\d{10}$'::text THEN (((SUBSTRING(p."phoneNumber" FROM 1 FOR 3) || '-'::text) || SUBSTRING(p."phoneNumber" FROM 4 FOR 3)) || '-'::text) || SUBSTRING(p."phoneNumber" FROM 7 FOR 4)
            ELSE p."phoneNumber"
        END AS "placePhoneNumber",
    COALESCE(pti."ledaId", '0'::text) AS "captainId",
    COALESCE(NULLIF(pti."fullName", ''::text), 'No Captain'::text) AS "captainFullName",
        CASE
            WHEN COALESCE(pti."ledaId", '0'::text) = '0'::text THEN 'XXX-XXX-XXXX'::text
            WHEN pi."phoneNumber" ~ '^\d{10}$'::text THEN (((SUBSTRING(pi."phoneNumber" FROM 1 FOR 3) || '-'::text) || SUBSTRING(pi."phoneNumber" FROM 4 FOR 3)) || '-'::text) || SUBSTRING(pi."phoneNumber" FROM 7 FOR 4)
            ELSE pi."phoneNumber"
        END AS "captainPhoneNumber"
   FROM ( SELECT leda_roster_info."seasonCode",
            sub_division.team_info ->> 'teamId'::text AS teamid,
            sub_division.team_info ->> 'placeId'::text AS placeid
           FROM leda_roster_info,
            LATERAL ( SELECT teams.team_info
                   FROM ( SELECT divs.key AS division,
                            subdivs.key AS subdivision,
                            pools.key AS pool,
                            pools.value AS team_info
                           FROM json_each(leda_roster_info."teamInformation") divs(key, value)
                             CROSS JOIN LATERAL json_each(divs.value -> 'subdivisions'::text) subdivs(key, value)
                             CROSS JOIN LATERAL json_each(subdivs.value) pools(key, value)) teams) sub_division) info
     JOIN maint.leda_maint_seasons s ON info."seasonCode" = s."seasonCode"
     LEFT JOIN leda_place_info p ON info.placeid::bigint = p."ledaId"
     LEFT JOIN leda_player_team_info pti ON info.teamid::bigint = pti."teamLedaId" AND pti."isCaptain" = true
     LEFT JOIN leda_player_info pi ON COALESCE(pti."ledaId", '0'::text)::bigint = pi."ledaId";