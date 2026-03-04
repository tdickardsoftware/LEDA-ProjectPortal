-- View: public.leda_place_team_history

-- DROP VIEW public.leda_place_team_history;

CREATE OR REPLACE VIEW public.leda_place_team_history
 AS
 SELECT r."seasonCode",
    t."teamName",
    team_json."teamId",
    team_json."placeId",
    p.name AS placename
   FROM ( SELECT leda_roster_info."seasonCode",
            jsonb_path_query(leda_roster_info."teamInformation"::jsonb, '$.*."subdivisions".*.*'::jsonpath) ->> 'teamId'::text AS "teamId",
            jsonb_path_query(leda_roster_info."teamInformation"::jsonb, '$.*."subdivisions".*.*'::jsonpath) ->> 'placeId'::text AS "placeId"
           FROM leda_roster_info) team_json
     LEFT JOIN leda_team_info t ON team_json."teamId" = t."ledaId"::text
     LEFT JOIN leda_roster_info r ON team_json."seasonCode" = r."seasonCode"
     LEFT JOIN leda_place_info p ON team_json."placeId" = p."ledaId"::text;

ALTER TABLE public.leda_place_team_history
    OWNER TO admin;