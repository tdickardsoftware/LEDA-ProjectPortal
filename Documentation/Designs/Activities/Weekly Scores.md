# Design for Weekly Scores
The purpose for this design is to implement the functionality to support Weekly Scores. With this design we will add the ability to view, create, edit, export, and delete score sheets

## Creating a PostgreSQL table
table name: leda_weekly_score
Columns: id int, seasonCode str, playerNumber int, weekNumber int, division str, subdivision int, homeOrAway char(1), homeTeamId int, awayTeamId int, displayOrder int*, gameInformation str**, wonGameInformation str-, pointsGameInformation str--, paidWeeklyFees bool, homeScore int, awayScore int
*displayOrder will be set for each team each week. If a team is home the display order will be set from the teams table. If the team is away the displayOrder will be the number from the teams table +500
**gameInformation this will be stored dynamically in a JSON format like this:
{
    game1: true,
    game2: false,
    game3: false
}
-wonGameInformation will be stored dynamically in a JSON format like this:
{
    game1: true, 
    game2: true, 
    game3: false
}
--pointsGameInformation will be store dynamically in a JSOn format like this:
{
    game1: 2,
    game2: 1,
    game3: 0
}