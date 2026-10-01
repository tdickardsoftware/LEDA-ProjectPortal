-- View: public.leda_scoresheets_matchups

-- DROP VIEW public.leda_scoresheets_matchups;

CREATE OR REPLACE VIEW public.leda_scoresheets_matchups
 AS
 WITH schedule_matchup_pairs AS (
         SELECT DISTINCT s."seasonCode",
            s."weekNum",
            s.division,
            s.subdivision,
            s."teamLetter" AS home_team_letter,
            s."oppTeamLetter" AS away_team_letter
           FROM leda_schedule s
          WHERE s.home = true
        ), scoresheet_matchup_pairs AS (
         SELECT DISTINCT home_ti."seasonCode",
            home_ti."weekNum",
            home_ti.division,
            home_ti.subdivision,
            home_ti."teamLetter" AS home_team_letter,
            away_ti."teamLetter" AS away_team_letter
           FROM leda_weekly_scoresheets_team_game_info gi
             JOIN leda_weekly_scoresheets_team_info home_ti ON gi."seasonCode" = home_ti."seasonCode" AND gi."weekNum" = home_ti."weekNum" AND gi.division = home_ti.division AND gi.subdivision = home_ti.subdivision AND gi."homeTeamId" = home_ti."teamId" AND home_ti.home = true
             JOIN leda_weekly_scoresheets_team_info away_ti ON gi."seasonCode" = away_ti."seasonCode" AND gi."weekNum" = away_ti."weekNum" AND gi.division = away_ti.division AND gi.subdivision = away_ti.subdivision AND gi."awayTeamId" = away_ti."teamId" AND away_ti.home = false
        ), matchup_pairs AS (
         SELECT scoresheet_matchup_pairs."seasonCode",
            scoresheet_matchup_pairs."weekNum",
            scoresheet_matchup_pairs.division,
            scoresheet_matchup_pairs.subdivision,
            scoresheet_matchup_pairs.home_team_letter,
            scoresheet_matchup_pairs.away_team_letter
           FROM scoresheet_matchup_pairs
        UNION
         SELECT schedule_matchup_pairs."seasonCode",
            schedule_matchup_pairs."weekNum",
            schedule_matchup_pairs.division,
            schedule_matchup_pairs.subdivision,
            schedule_matchup_pairs.home_team_letter,
            schedule_matchup_pairs.away_team_letter
           FROM schedule_matchup_pairs
          WHERE NOT (EXISTS ( SELECT 1
                   FROM scoresheet_matchup_pairs sm
                  WHERE sm."seasonCode" = schedule_matchup_pairs."seasonCode" AND sm."weekNum" = schedule_matchup_pairs."weekNum" AND sm.division = schedule_matchup_pairs.division AND sm.subdivision = schedule_matchup_pairs.subdivision AND sm.home_team_letter::text = schedule_matchup_pairs.home_team_letter::text AND sm.away_team_letter::text = schedule_matchup_pairs.away_team_letter::text))
        ), team_matchups AS (
         SELECT matchup_pairs."seasonCode",
            matchup_pairs."weekNum",
            matchup_pairs.division,
            matchup_pairs.subdivision,
            jsonb_object_agg(matchup_pairs.home_team_letter, matchup_pairs.away_team_letter) AS team_pairs
           FROM matchup_pairs
          GROUP BY matchup_pairs."seasonCode", matchup_pairs."weekNum", matchup_pairs.division, matchup_pairs.subdivision
        ), subdivision_matchups AS (
         SELECT team_matchups."seasonCode",
            team_matchups."weekNum",
            team_matchups.division,
            jsonb_object_agg(team_matchups.subdivision, team_matchups.team_pairs) AS subdivision_pairs
           FROM team_matchups
          GROUP BY team_matchups."seasonCode", team_matchups."weekNum", team_matchups.division
        )
 SELECT "seasonCode",
    "weekNum",
    jsonb_object_agg(division, subdivision_pairs) AS "matchupData"
   FROM subdivision_matchups
  GROUP BY "seasonCode", "weekNum"
  ORDER BY "seasonCode", "weekNum";

ALTER TABLE public.leda_scoresheets_matchups
    OWNER TO admin;

