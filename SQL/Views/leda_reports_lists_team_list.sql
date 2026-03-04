-- View: public.leda_reports_lists_team_list

-- DROP VIEW public.leda_reports_lists_team_list;

CREATE OR REPLACE VIEW public.leda_reports_lists_team_list
 AS
 SELECT spcs."seasonCode",
    spcs."desc",
    spcs."teamId",
    lti."teamName",
    spcs.division,
    rtv."divisionInfo",
    spcs."placeName",
    spcs."addressFirstLine",
    spcs."addressSecondLine",
    spcs."placePhoneNumber",
    spcs."captainFullName",
    spcs."captainPhoneNumber"
   FROM leda_reports_captains_mtg_schedules_place_captain_season_info spcs
     JOIN leda_team_info lti ON spcs."teamId"::bigint = lti."ledaId"
     JOIN leda_roster_teams_view rtv ON spcs."teamId"::bigint = rtv.ledaid::bigint;

ALTER TABLE public.leda_reports_lists_team_list
    OWNER TO admin;

