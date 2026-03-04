-- View: public.leda_reports_lists_captains_report

-- DROP VIEW public.leda_reports_lists_captains_report;

CREATE OR REPLACE VIEW public.leda_reports_lists_captains_report
 AS
 SELECT lpti."ledaId",
    lpti."isCaptain",
    concat(COALESCE(lp."lastName", ''::text), ', ', COALESCE(lp."firstName", ''::text), ' ', COALESCE(lp."middleInitial", ''::character varying)) AS "fullName",
    lpti."cannotBeCaptain",
    lpti."badStanding",
    rtv."seasonCode",
    lti."teamName",
    lpi.name AS "placeName",
    rtv."divisionInfo",
    concat(SUBSTRING(lp."phoneNumber" FROM 1 FOR 3), '-', SUBSTRING(lp."phoneNumber" FROM 4 FOR 3), '-', SUBSTRING(lp."phoneNumber" FROM 7 FOR 4)) AS "phoneNumber"
   FROM leda_player_team_info lpti
     JOIN leda_roster_teams_view rtv ON lpti."teamLedaId" = rtv.ledaid::bigint
     JOIN leda_place_info lpi ON rtv."placeId"::bigint = lpi."ledaId"
     JOIN leda_team_info lti ON lpti."teamLedaId" = lti."ledaId"
     JOIN leda_player_info lp ON lpti."ledaId"::bigint = lp."ledaId"
  WHERE lpti."isCaptain" = true;

ALTER TABLE public.leda_reports_lists_captains_report
    OWNER TO admin;

