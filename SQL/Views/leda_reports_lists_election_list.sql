-- View: public.leda_reports_lists_election_list

-- DROP VIEW public.leda_reports_lists_election_list;

CREATE OR REPLACE VIEW public.leda_reports_lists_election_list
 AS
 SELECT DISTINCT concat(COALESCE(lpi."lastName", ''::text), ', ', COALESCE(lpi."firstName", ''::text), ' ', COALESCE(lpi."middleInitial", ''::character varying)) AS "fullName",
    pps."fiscalYear"
   FROM leda_player_info lpi
     JOIN leda_player_paid_status pps ON lpi."ledaId" = pps.playerid::bigint;

ALTER TABLE public.leda_reports_lists_election_list
    OWNER TO admin;

