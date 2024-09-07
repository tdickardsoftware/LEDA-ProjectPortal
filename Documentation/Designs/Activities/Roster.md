# Design for Rosters
The purpose of this design is to implement the functionality to support Rosters, with this you will be able to view, edit, add, copy, or delete a roster.

## Create a table in PostgreSQL
Table Name: leda_team_hist
Columns: id int, seasonCode str, teamId int, memberId int, captain bool, division str, subdivision int, teamLetter char(1)
seasonCode comes from table leda_maint_seasons
teamId comes from leda_team_info
memberId comes from leda_player_info

table name: leda_roster_info
Columns: id int, seasonCode str, teamId int, barId int, notes str, establishDate date(MM-DD-YYYY), finalStandings int, teamPaid bool, barPaid bool
seasonCode comes from table leda_maint_seasons
teamId comes from leda_team_info
barId comes from leda_place_info

table name: leda_team_payout_info
columns: id int, seasonCode str, teamId int, payoutCheckAdjustedAmount number, payoutCheckAdjustmentReason str, payoutCheckGrossAmmount number, payoutCheckNumber int
seasonCode comes from table leda_maint_seasons
teamId comes from leda_team_info

## View a roster
Under the activies header there will be a link called Roster, when clicked on it will bring you to the Rosters page, when you enter select the Season Code you are looking for it will pull up the roster for that season.
*A list of the season codes will be obtained from the leda_maint_seasons table

Once a roster has been selected you will be able to see the information from a team, like division information, teamId, team name, bar id, bar name, if the team/bar paid any notes, the option to view the players on that team.

Division information will look like this: S1A or Sapphire, sub division 1, team letter A and all information from the table leda_schedule_information


If you view players it will show you Player Id, Name (Dickard, Tyler), Paid Status, Captain, Bad Standing, and Cannot Be Captain. You will also have the ability to delete or add players to the selected team. All of this information will come from the table leda_player_info and leda_membership_info

## Add to a roster
While in the roster menu if the season you are looking to make a roster for does not exist there is a button named Create Season which will popup the Add Season popup from the Season design.

After selecting a season, you can add divisions (emerald, diamond, etc.), from then you can create subdivisions(will appear as Subdivision 1 (6) the six stands for amount of teams in that subdivision)

You can then select that subdivision, and begin to add teams, when adding a team all of the listed players will pull up by default, you can then add/remove players if needed. 
Once the team is added a team letter will be assigned by automatically, so with the current implementation you can have 26 teams per subdivision (A-Z)
This will then create the division information for a team, for example one could look like D1H Diamond, subdivision 1, letter H

## Editing a roster
You can drag and drop teams from one subsection to another, it will also automatically reassign the team letter around the change.
ex: say you want to move a team from subsection 1 to subsection 2, and its letter in 1 is B but you want it to be C in subsection 2. When moved it will automatically shift the remaining teams to fill the gap of B and then update the entries in subsection 2, and the old C will become D, and so on so forth. 
*This will auto update the schedule

You can also move entire subsections to another division, and they will adjust the numbers of the subsections and the division name automatically.

You can also change the division to another division, so say you accidentally created everything as Diamond, but actually wanted Emerald, you can change that and the teams will automatically update along with the schedule.

## Copy a roster
You can select a previous seasons roster to copy, for example if W25 is the same as W24 you can just open W24 and click the Copy Roster button and it will open a pop up for you to select which new season you would like to copy the roster to.
You can also create the season if it doesnt exist yet from this pop up

## Deleting from a roster/wiping the roster
You can delete a team, subdivison, or division from the roster and it will update the database with the removals.
You can also wipe the roster and delete every division, subdivision, and team from that seasons roster.  


