-- View: public.leda_scoresheets_tally

-- DROP VIEW public.leda_scoresheets_tally;

CREATE OR REPLACE VIEW public.leda_scoresheets_tally
 AS
 WITH matchup_pairs AS (
         SELECT s."seasonCode",
            s."weekNum",
            s.division,
            s.subdivision,
            s."teamLetter" AS home_team_letter,
            s."oppTeamLetter" AS away_team_letter
           FROM leda_schedule s
          WHERE s.home = true
        ), expected_counts AS (
         SELECT matchup_pairs."seasonCode",
            count(*) AS "expectedScoresheets"
           FROM matchup_pairs
          GROUP BY matchup_pairs."seasonCode"
        ), completed_counts AS (
         SELECT leda_weekly_scoresheets_team_game_info."seasonCode",
            count(*) AS "completedScoresheets"
           FROM leda_weekly_scoresheets_team_game_info
          WHERE leda_weekly_scoresheets_team_game_info.completed = true
          GROUP BY leda_weekly_scoresheets_team_game_info."seasonCode"
        ), total_weeks AS (
         SELECT matchup_pairs."seasonCode",
            max(matchup_pairs."weekNum") AS "totalWeeks"
           FROM matchup_pairs
          GROUP BY matchup_pairs."seasonCode"
        )
 SELECT COALESCE(e."seasonCode", c."seasonCode", w."seasonCode") AS "seasonCode",
    COALESCE(e."expectedScoresheets", 0::bigint) AS "expectedScoresheets",
    COALESCE(c."completedScoresheets", 0::bigint) AS "completedScoresheets",
    COALESCE(w."totalWeeks", 0::bigint) AS "totalWeeks"
   FROM expected_counts e
     FULL JOIN completed_counts c ON e."seasonCode" = c."seasonCode"
     FULL JOIN total_weeks w ON COALESCE(e."seasonCode", c."seasonCode") = w."seasonCode"
  ORDER BY (COALESCE(e."seasonCode", c."seasonCode", w."seasonCode"));

ALTER TABLE public.leda_scoresheets_tally
    OWNER TO admin;

