-- View: public.leda_scoresheets_completed_weeks

-- DROP VIEW public.leda_scoresheets_completed_weeks;

CREATE OR REPLACE VIEW public.leda_scoresheets_completed_weeks
 AS
 SELECT sw."seasonCode",
    sw."weekNum",
    COALESCE(bool_and((EXISTS ( SELECT 1
           FROM leda_weekly_scoresheets_team_game_info gi
          WHERE gi."seasonCode" = s."seasonCode" AND gi."weekNum" = s."weekNum" AND gi.division = s.division AND gi.subdivision = s.subdivision AND gi."homeTeamId" = s."teamId" AND gi."awayTeamId" = s."oppTeamId" AND gi.completed = true))) FILTER (WHERE s.id IS NOT NULL), true) AS "scoresheetsProcessed"
   FROM ( SELECT DISTINCT leda_schedule."seasonCode",
            leda_schedule."weekNum"
           FROM leda_schedule) sw
     LEFT JOIN leda_schedule s ON s."seasonCode" = sw."seasonCode" AND s."weekNum" = sw."weekNum" AND s.home = true
  GROUP BY sw."seasonCode", sw."weekNum"
  ORDER BY sw."seasonCode", sw."weekNum";

ALTER TABLE public.leda_scoresheets_completed_weeks
    OWNER TO admin;

