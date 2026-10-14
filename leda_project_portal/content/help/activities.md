# Activities

The Activities section is where league administrators run the season (rosters, schedules, weekly scoresheets, Trails results and payouts), it is limited to the Developer and Office Admin roles, and its landing page has one card for each page below that you click to open it.

## Payouts

![Payouts page](/help-images/payouts.png)

![Add Global Adjustment dialog](/help-images/payouts-global-adjustment.png)

Work out and adjust end-of-season payouts for every team in the season.

### Features

- **Season selection.** The page opens on the current season. To work on another season, untick **Current Season?** and pick the season from the list.
- **Divisions, subdivisions and teams.** Teams are grouped under their division and subdivision. Divisions and subdivisions start expanded; team rows start collapsed. Click a row to open or close it.
- **Calculate Payouts.** This button appears only while no payouts have been saved for the season.
  - It shows a progress bar of completed scoresheets for the season.
  - It stays disabled (hover to see "Scoresheets are not yet complete") until every scoresheet is complete, then reads **Calculate Payouts**.
  - Clicking it ranks the teams in each subdivision by their total points after the final week and assigns each place its payout amount from the Payout Tiers set up in Maintenance.
- **Team rows.** Once calculated, each team shows its place, team letter, team name and **Base Winnings**. If the team has adjustments, **Winnings After Adjustments** is shown too. Teams are listed in order of place.
- **Add Adjustment (one team).** Hover over a team row and click **Add Adjustment**. Enter:
  1. **Amount** (required).
  2. **Type**: **Credit** adds money, **Debit** takes money away.
  3. **Notes** (optional; a default note is used if left blank).
  4. Click **Save Team Adjustment**.
- **View, edit or remove a team adjustment.** Open the team row to see its adjustments, split into *Global Adjustments* and *Team-Specific Adjustments*. Hover over a team-specific adjustment and click the pencil to edit it or the **X** to remove it (you will be asked to confirm).
- **Add Global Adjustment.** Applies one credit or debit to every team in every division and subdivision. The form is the same as for a team adjustment (button: **Save Global Adjustment**).
- **Manage Global Adjustments.** Opens a table of all global adjustments showing amount, type, notes and how many teams each is applied to. Use the pencil to edit one (this updates every team) or the **X** to remove it from all teams (you will be asked to confirm). Hovering over a global adjustment on a team row and clicking its pencil or **X** opens this same table with that adjustment highlighted.
- **Saving.** Changes save automatically about a second and a half after you stop editing, and the save indicator shows the status. **Save Now** saves immediately.
- **Reset Payouts.** Clears every place, amount and adjustment for the season after you confirm.

### Tips

- If **Calculate Payouts** is greyed out, finish and mark complete the remaining scoresheets on the Weekly Scoresheets page first.
- Adjustments are added on top of the base winnings; they never change the base amount.
- Reset Payouts removes everything for the season, including adjustments, so use it with care.

## Rosters

![Rosters page with a division expanded](/help-images/rosters-division.png)

Build and maintain each season's divisions, subdivisions and teams.

You can reach a season's roster directly from the Rosters page, or open a specific season straight away by going to its own Rosters page. If that season has no roster record, a "404 Not Found – Could not find the requested Season Code" page appears with a **Go Back** button.

### Features

- **Season selection.** The page opens on the current season. Untick **Current Season?** to choose a different one.
- **Roster Page Tools.** The bar at the top holds **Add Division**, **Delete Roster**, **Copy Roster**, the save indicator and the save buttons.
- **Navigation tree.** The left-hand list shows each division with its subdivisions. Click a subdivision to see and edit its teams. If the season has no roster yet, the page says "Add a division to get started."
- **Add Division.** Click **Add Division**, choose a division from the list (divisions already in the roster are not offered) and click **Add Division**.
- **Add Subdivision.** Under a division in the left-hand list, click **+ Add Subdivision**. Subdivisions are named "Subdivision 1", "Subdivision 2" and so on.
- **Remove a division or subdivision.** Click the red **X** beside it and confirm. Removing a subdivision renumbers the remaining ones, and all its teams are removed from the roster.
- **Add Team.** Select a subdivision, then click **Add Team** and fill in:
  1. **Team** (teams already on the roster are not offered).
  2. **Home Place**, with a count of how many boards are already assigned there.
  3. Leave **Auto assign team letter** ticked to give the team the next free letter (A to H), or untick it and choose a letter.
  4. Click **Add Team**.
  A subdivision holds a maximum of 8 teams; the button then reads **Max Teams (8)**.
- **Backup Location.** When a subdivision has an odd number of teams, an **Add Backup Location** button appears. Choose a place to use as the backup venue; it is listed as "Backup Location" under the last team letter. Click the **X** beside it to remove it. It is also removed automatically if the team count becomes even. The backup location can then be chosen for matches on the Scheduling page.
- **Edit a team.** Click the pencil on a team to change its team, home place or name in the same slot.
- **Remove a team.** Click the red **X** on a team and confirm. The remaining teams are re-lettered A, B, C and so on.
- **Re-order teams.** Drag a team card onto another team in the same subdivision to swap their letters.
- **Open a team.** Click a team's name to open its Teams management page; you will return to the same subdivision afterwards.
- **Saving.**
  - A brand-new roster must be saved with **Save Roster**; the page reloads once saved.
  - For an existing roster, changes save automatically about a second and a half after you stop editing. **Save Now** saves straight away and **Reset Changes** discards edits made since the last save.
  - When an existing roster is saved, the schedule for that season is updated to match: matches against teams that were removed are dropped and the team letters are refreshed.
- **Delete Roster.** Removes the season's whole roster after you confirm. It is only shown for seasons that already have a roster.
- **Copy Roster.** Copies the roster from one season to another.
  1. Choose the **Source Season Code** and the **Target Season Code**.
  2. Click **Copy Roster** to copy only, or **Copy Roster & Generate Schedule** to copy and then open the schedule generator for the target season.
  3. Confirm the warning. Any existing roster on the target season is overwritten.
- **Save Roster & Generate Schedule.** Saves your changes, then opens the schedule generator for the season (see [Scheduling](#scheduling)). It is disabled if the season has no game dates set up.

### Tips

- Set up the roster before the schedule: the Scheduling and Weekly Scoresheets pages both need a roster to exist.
- Generating a schedule permanently deletes all existing data for that season (schedule, scoresheets, points, mentions, penalties and payouts). Do this before the season starts.

## Scheduling

![Scheduling page](/help-images/scheduling.png)

![Auto-Generate Schedule dialog](/help-images/scheduling-generate.png)

View and edit each subdivision's weekly match schedule for a season, or generate the whole season's schedule automatically.

### Features

- **Season selection.** Choose a season in the **Season Code** box (untick **Current Season?** to pick a different one). If the season has no roster, a notice says "No roster found for this season" with a link to create one.
- **Navigation tree.** Pick a subdivision from the left-hand list to display its schedule. A subdivision's backup location, if one was set on the Rosters page, is shown in the **Backup Location** box.
- **Schedule grid.** Each row is a week (**Date 1**, **Date 2** and so on, with the date). Each column is a team. Each filled-in cell shows Home or Away, the opposing team, the start time and the venue. A BYE week shows "BYE WEEK".
- **Add Matchup.** Click the **+** in an empty cell and fill in:
  1. **Match Start Time** (default 7:30 PM).
  2. **Home Team?** to say whether the selected team is the home team.
  3. **BYE Week** if the team has no match that week (no opponent or time needed).
  4. **Opposing Team** (teams that already have a match that week are not offered).
  5. **Playing at Backup Location**, if the subdivision has a backup location.
  6. Click **Add Matchup**. The match is automatically added to both teams' columns.
- **Edit Matchup.** Hover over a match and click the pencil to change the time, home/away, opponent, BYE status or backup location. Changing the opponent also updates the other teams involved.
- **Remove Matchup.** Hover over a match and click the red **X**, then confirm. The match is removed for both teams.
- **Locked matches.** A match with a padlock already has points entered on its scoresheet. Only its start time can be changed and it cannot be removed.
- **Generate Schedule.** Creates a full round-robin schedule for every subdivision in the season.
  1. Click **Generate Schedule**.
  2. Set the **Default Match Time**.
  3. Optionally tick **Generate a different matchup layout** or click **Try Another Layout** for a different arrangement.
  4. **Use legacy LEDA pairing pattern** is ticked by default.
  5. Check the **Preview** table, which shows each subdivision's team count, rounds per cycle and weeks, plus any warnings. A subdivision needs at least two teams.
  6. Click **Generate** and confirm the warning.
  Teams only play opponents in their own subdivision. If there are more weeks than one round-robin, matchups repeat in a new cycle.
- **Saving.** Adding, editing and removing matchups save automatically. A generated schedule is saved as soon as it is created. **Save Now** forces a save, and the indicator beside it shows the status.

### Tips

- Generating a schedule permanently deletes all existing data for the season (schedule, scoresheets, points, mentions, penalties and payouts). It cannot be undone.
- Locked matches can only be fully edited by users with the Developer role, who get a checkbox above the grid to allow it.
- The generator uses the game dates configured for the season, so set those up first.
- Use the BYE option for any team without an opponent in a given week; the Weekly Scoresheets page has a matching way to process bye weeks.

## Trails Activity

![Trails activity page](/help-images/trails-activity.png)

Record who played in each Trails event and how they placed.

### Features

- **Year selector.** Choose a year at the top of the left-hand list. It starts on the current year, or the most recent year with Trails data.
- **Dates list.** Trails dates for the chosen year are grouped by month. Click a date to open it. If today has a Trails event, it opens automatically.
- **Players on a date.** The date's page lists each player's LEDA ID and name. Temporary players are marked "(Temp)". Click a player to expand their **Trails Points**, **Singles Place**, **Doubles Place** and **Notes**.
- **Add Player to an existing date.** On an open date, click **Add Player**:
  1. Choose the **Player** (players already on that date are not offered), or click **Add Temp Player** to create or choose a temporary player instead.
  2. Enter **Trails Points**, **Singles Place** and **Doubles Place**. Blank numbers count as 0.
  3. Add **Notes** if needed.
  4. Click **Add Player**. The player is saved straight away.
- **Edit a player.** Expand the player, click the pencil, change the details and click **Update**.
- **Remove a player.** Click the red **X** beside the player and confirm. If the last player is removed, the date disappears from the list.
- **Create a new Trails date.** Click **New Date** (or open the page with no date selected) to see **Add a Trails Date**:
  1. Pick the date. Dates that already exist cannot be chosen.
  2. Click **Add Player** and fill in the player details as above. Each player you add is held in a list on the page.
  3. Remove any player from the list with the **X** if you made a mistake.
  4. Click **Submit** to save the date with all its players. The page then reloads.

### Tips

- A new date is only created when you click **Submit**; nothing is saved until then.
- Use **Add Temp Player** for guests who do not have a LEDA ID.

## Weekly Scoresheets

![Weekly Scoresheets week selection](/help-images/weekly-score-weeks.png)

Enter the results of each weekly matchup: who played in which game, who won each of the 11 games, penalties and mentions.

You can open the Weekly Scoresheets page and choose a season, or go straight to a particular season's page. If that season has no roster, a "404 Not Found – Could not find the requested Season Code" page appears; if the season has no schedule, the page shows "No schedule found for this season" with a link to Scheduling.

### Features

- **Choosing what to score.**
  1. Pick the season (untick **Current Season?** to change it).
  2. Pick the **Week**. Weeks are listed as "Week N - date".
  3. The left-hand list then shows every matchup for that week, grouped by division and subdivision (for example "A - B" for team A at home against team B).
  4. Click a matchup to open its scoresheet.
- **Completion indicators.** A green tick beside a matchup means it has been marked complete; a yellow warning triangle means it has not. If the previous week has matchups that were not marked complete, a yellow banner warns you at the top of the page.
- **Missing Scoresheets.** Once a week is chosen, this button lists every matchup that is missing or incomplete for that week, with counts of missing (red) and incomplete (yellow). Click a matchup in the list to open it.
- **The scoresheet.** A matchup page shows the division, subdivision and "Matchup for A vs B", then three sections: **Home**, **Away** and **Game Points**.
- **Player participation (Home and Away).**
  - Each team shows its name, team ID and letter.
  - The table lists each player with **Game 1** to **Game 11** columns. Click a cell to mark that the player played that game; click it again to clear it.
  - Players can be re-ordered by dragging, or by clicking the swap icon on one player and then another.
  - **Add Temp Player** adds a temporary player to just this matchup, either by creating a new temp player or choosing an existing one.
- **Game Points table.** For each of the 11 games:
  1. Tick **Home Win** if the home team won the game.
  2. Optionally enter the **Home Points** and **Away Points** for the game.
  The **Total** row shows each team's wins, any penalty deduction and a **Final** score. A team's score is its number of game wins minus its penalty points, and never drops below 0.
- **Weekly player points.** Players earn one point for each of Games 1 to 4 they played; Games 5 to 11 do not add to a player's weekly points.
- **Penalties.** Click **Penalties** on the Home or Away section:
  1. Choose the **Penalty**.
  2. Adjust the **Points** if needed.
  3. Add **Notes** if needed and save.
  Penalties are listed under the team's name. Edit them with the pencil or remove them with the **X** (you will be asked to confirm). The total penalty points are deducted from that team's final score.
- **Mentions.** Click **Mentions** beside a player to add a mention (such as an award or infraction):
  1. Choose the **Select Mention**. Its code, description and default points are shown.
  2. Change the **Points** if needed and enter a **Count/Darts** value and **Notes** if required.
  3. Click **Add Mention**.
  Existing mentions for that player in this week are listed below the form; hover to edit (pencil) or delete (**X**, with confirmation). Mentions are saved immediately and do not need the Save buttons.
- **Saving and completing.** At the bottom of the scoresheet:
  - Changes save automatically about a second and a half after you stop editing, and the save indicator shows the status. **Save Now** saves immediately.
  - **Mark Complete** and **Save & Mark Complete** save the scoresheet and mark the matchup complete (the green tick). Marking complete is never automatic. **Mark Complete** is disabled once the matchup is already complete.
  - **Reset Changes** restores the scoresheet to how it was at the previous save.
  - **Delete Scoresheet** removes all the data for the matchup (game results, player participation, penalties and mentions) after you confirm, and recalculates the cumulative points for the following weeks.
- **Unsaved changes.** If you switch matchup, week or season with unsaved changes, you are asked to type **1** to save, **2** to save and mark complete, or **3** to discard. Closing or reloading the page also warns you.
- **Bye weeks.** Teams with no opponent show as "X - Bye" and cannot be opened.
  - Click the process icon beside a bye row to give that team 0 points and mark the bye complete.
  - **Process All Bye Weeks** does this for every bye in the selected week. Once all are done it reads **Bye Weeks Processed**.

### Tips

- Mark every matchup complete: payouts can only be calculated once all scoresheets for the season are complete.
- Use **Missing Scoresheets** at the end of each week to catch anything you skipped.
- Process bye weeks as part of each week's wrap-up so their completion indicators turn green.
- Deleting a scoresheet cannot be undone.
