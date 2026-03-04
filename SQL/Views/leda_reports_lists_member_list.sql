-- View: public.leda_reports_lists_member_list

-- DROP VIEW public.leda_reports_lists_member_list;

CREATE OR REPLACE VIEW public.leda_reports_lists_member_list
 AS
 SELECT DISTINCT rpv."seasonCode",
    rpv.ledaid AS "playerId",
    concat(COALESCE(lpi."lastName", ''::text), ', ', COALESCE(lpi."firstName", ''::text), ' ', COALESCE(lpi."middleInitial", ''::character varying)) AS "fullName",
    concat(SUBSTRING(lpi."phoneNumber" FROM 1 FOR 3), '-', SUBSTRING(lpi."phoneNumber" FROM 4 FOR 3), '-', SUBSTRING(lpi."phoneNumber" FROM 7 FOR 4)) AS "phoneNumber",
    lpi.email,
    lpi."addressOne",
    lpi."addressTwo",
    lpi.city,
    lpi.state,
    lpi.zip,
    rtv."divisionInfo",
    rtv.division
   FROM leda_roster_players_view rpv
     JOIN leda_players_roster_history prh ON rpv.ledaid::bigint = prh.player_id
     JOIN leda_player_info lpi ON rpv.ledaid::bigint = lpi."ledaId"
     JOIN leda_roster_teams_view rtv ON prh.team_id = rtv.ledaid::bigint;

ALTER TABLE public.leda_reports_lists_member_list
    OWNER TO admin;

