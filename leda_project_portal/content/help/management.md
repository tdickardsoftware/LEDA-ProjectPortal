# Management

Management is where Office Admins and Developers view and maintain the league's Places, Players and Teams; anyone else cannot open this section.

## Places

![Places page](/help-images/places.png)

![Add Place dialog](/help-images/places-add.png)

Browse, add, edit and delete the bars and venues that host league play.

### Features

- **The table.** Each row is a place, showing LEDA ID Number, Place Name, Address, Phone Number and Place Type. Tick the checkbox at the start of a row to select it; the checkbox in the header selects every row on the page.
- **Which buttons need a selection.** **View Place** and **Edit Place** work on exactly one selected row. **Delete Place** works on one or more selected rows. They stay greyed out until the selection fits. **Add Place +** is always available.
- **Search.** Type in the **Search...** box above the table. Results update by themselves a moment after you stop typing, or immediately when you press **Enter**. Press **Esc** or click **Clear** to remove the search. Searching always sends you back to page 1.
- **Searching a specific column.** To search one column, write the column name in quotes, an equals sign and the value, for example `"Place Type"="Bar"`. Join conditions with `and` / `or`. You do not have to type this by hand:
  - Right-click a column heading and choose **Add "Column" to search**. Then type the value between the quotes.
  - Right-click a cell and choose **Search for exact match** (only that value) or **Search for all records containing** (partial match). Doing this on more cells in the same column adds them to the same search.
- **Sorting.** Click a column heading to sort by it; click again to reverse the order. The table starts sorted by LEDA ID.
- **Rows per page.** Use the drop-down next to the refresh button to show 10, 25, 50 or 100 rows. Use **Previous** and **Next** under the table to move between pages (**Page X of Y** shows where you are).
- **Refresh.** Click the circular-arrow button to reload the table from the latest data. It also clears any selected rows.
- **Remembered position.** The page, search and sorting are remembered while you open a place and come back with **Go Back**. If you leave for another part of the portal, the table returns to page 1.
- **Add a place.** Click **Add Place +** and work through four steps. Click **Next** to move on; a step will not continue until its required fields (marked with *) are filled in correctly. **Back** returns to the previous step (and **Cancel** closes the form on step 1). On the last step, click **Submit**.
  1. **Basic Info:** Name of Place *, Website, Number of Boards.
  2. **Contact Info:** Address One *, Address Two, City *, State, Zip Code *, Email, Phone Number *, Other Number.
  3. **Membership Info:** the **Generate LEDA ID** box is ticked by default and the system assigns the next ID. Untick it to type your own ID; if it is already taken you will see "This LEDA ID is already in use". Also search for and choose the **Place Owner** *, choose the **Place Type** * and the **Established Date** *.
  4. **Additional Info:** Last Sanctioning Date, the **Send Mailings**, **Regular Sponsor**, **Current Sponsor** and **Issues** checkboxes, and a free-text notes box.
- **Edit a place.** Select one row and click **Edit Place**. The form has the same four steps as adding, filled in with the current details. You can click any step heading to jump straight to it. The LEDA ID cannot be changed. Once you have changed something, a **Skip to Update** button appears so you can save without clicking through the remaining steps; **Update** saves on the last step.
- **Delete places.** Select one or more rows and click **Delete Place**. A box asks "Are you sure you want to delete N row(s)?". Click **Delete** to confirm or **Cancel** to back out.
- **Open a place.** Select one row and click **View Place** to open its detail page (see Place Details).

### Tips

- Phone numbers and email addresses are checked as you type; fix any red message under a field before continuing.
- Place Types are managed under Maintenance; if the type you need is missing from the list, add it there first.

## Place Details

![Place details page](/help-images/place-detail.png)

Shows everything on file for one place and gives quick access to its payments and team history.

### Features

- **Header.** The place name and LEDA ID number are shown at the top.
- **Place Information card.** Website, Number of Boards, Email, Phone Number, Other Number (if any), Address One, Address Two (if any), City, State and Zip.
- **Membership Information card.** Place Owner LEDA ID, Last Bar Fee Payment, Place Type, Established Date, Last Sanctioning Date, Send Mailings, Regular Sponsor, Current Sponsor and Issues (shown as Yes/No), plus any memo.
- **Place Actions** (the tabbed button bar above the cards):
  - **Edit Place** opens the same edit form described under Places. The page reloads after saving so the cards show the new details.
  - **Add Place Payment** opens the payment form with this place already chosen. Fill in the fields and click **Save Payment** (see Payments for what each field means).
  - **Payment History** opens a list of this place's payments: Payment #, Type, Payment Type, Amount, Season Code, Fiscal Year, Paid Off, Comp, Date and Notes. Use the date drop-down to show a single payment date, and **Filter by Type** to show one payment type (pick it, then click **Apply**). Active filters appear above the table; click one to remove it, or use **Clear Filters** in the type filter.
  - **Team History** opens a list of the teams this place has hosted by season (Season Code, Team ID and Team Name). Seasons where the place was a backup venue show "Backup Location".
- **Go Back** returns to the Places list.

### Tips

- If a page says the place was not found, the LEDA ID in the address does not exist; go back to the list and use **View Place** instead.

## Players

![Players page](/help-images/players.png)

![Add Player dialog](/help-images/players-add.png)

Browse, add, edit and delete league members, and clean up temporary players created during score entry.

### Features

- **Two tabs.** **Members** is the main list. **Temporary Players** lists players who were entered with just a name and have not been matched to a member yet.
- **Members table.** Columns are LEDA ID Number, Full Name, Phone Number and Email. Selecting rows, the **View Player**, **Edit Player** and **Delete Player** buttons, searching (including right-click search shortcuts), sorting, rows per page, paging, refresh and the remembered position all work exactly as described under Places.
- **Hide inactive players.** Tick this box above the table to leave out players who have been marked inactive. The table goes back to page 1.
- **Add a player.** Click **Add Player +** and work through four steps with **Next** / **Back**, then **Submit**. Fields marked * are required.
  1. **Personal Info:** First Name *, Nickname, Middle Initial, Last Name *, Gender *, Date of Birth.
  2. **Contact Info:** Address One *, Address Two, City *, State (starts as OH), Zip Code *, Email *, Phone Number *, Other Number. Tick **Email Unknown** if the player has no known email; the email box is then disabled and "UNKNOWN" is recorded.
  3. **Membership Info:** **Generate LEDA ID** is ticked by default so the system assigns the next ID; untick it to type your own (an ID already in use is rejected with "This LEDA ID is already in use"). Also choose the **Member Type** and **Established Date** *. Tick **Bad Standing** to enable a reason box and record why.
  4. **Additional Info:** **Lifetime Member** (with a reason box), **Take Off Mailing**, **Mail Standings**, **Form on File**, **Needs Member Card** (ticked by default), **Cannot be Captain**, Inactive Date and Last Trails Date.
- **Edit a player.** Select one row and click **Edit Player**. The form has the same four steps, filled in with the player's details; click any step heading to jump to it. The LEDA ID is shown but cannot be changed. After you change something, **Skip to Update** appears so you can save from any step; **Update** saves on the last step.
- **Delete players.** Select one or more rows, click **Delete Player** and confirm.
- **Temporary Players tab.** Shows Temp ID, First Name, M.I. and Last Name for every temporary player, or "No temporary players on record." when there are none. Each row has three actions:
  - **Convert to Member** opens the Add Player form with the name already filled in. Complete the steps and submit; the temporary record becomes a real member and a new LEDA ID is assigned automatically (the Generate LEDA ID option is hidden here).
  - **Link to Existing Player** is for when the temporary player is actually someone who is already a member. Choose the **Existing Player** * and click **Link Player**. Everything recorded for the temporary player (scoresheets, points, mentions, trails) moves onto that member and the temporary record is removed. This cannot be undone.
  - **Delete** removes the temporary player after you confirm. This cannot be undone.

### Tips

- Before converting, search the Members tab to make sure the person is not already a member; if they are, use **Link to Existing Player** instead so you do not create a duplicate.
- Bad Standing is shown for each player on their team's detail page, so fill in the reason.

## Player Details

![Player details page](/help-images/player-detail.png)

Shows one player's full profile and opens their history records.

### Features

- **Header.** The player's name and LEDA ID number.
- **Player Information card.** Date of Birth, Email, Phone Number, Other Number (if any), Address One, Address Two (if any), City, State and Zip.
- **Membership Information card.** Established Date, Bad Standing (and the reason, when set), Take Off Mailing, Mail Standings, Form On File, Needs Member Card, Inactive Date, Last Membership Fee Payment, Last Trails Date, Member Type, Cannot Be Captain and Lifetime Member (with its reason, when set).
- **Player Actions** (the tabbed button bar):
  - **Edit Player** opens the edit form described under Players.
  - **Trails History** lists changes to the player's trails points: Trails Date, Singles Place, Doubles Place, Previous Points, Total Points, Change (green for a gain, red for a loss) and Modified On.
  - **Mentions History** lists every mention (award) the player has received: Season Code, Week Number, Mention Code and Description, Top Darter Points, count, Notes and Creation Date.
  - **Payment History** lists the player's payments with the same columns, date drop-down and type filter described under Place Details.
  - **Add Player Payment** opens the payment form with this player already chosen (see Payments).
  - **Top Darter Points History** has a navigation tree on the left (calendar year, then season, then team, then game week). Click a season to see it, a team to see its season total split into base points and mention points plus the mentions earned, and a game to see that week's points and mentions. Mention points show in green for a gain and red for a deduction.
  - **Roster History** lists every team the player has been on: Season, Team Name, Division, Subdivision, Team Letter, Points and Place, 10 rows per page. Each row has three icon buttons (hover for their names) that open, in a new tab, the team's page, the season's roster, or the season's weekly scoresheet data.
- **Go Back** returns to the Players list.

## Teams

![Teams page](/help-images/teams.png)

![Add Team dialog](/help-images/teams-add.png)

Browse, add, edit and delete league teams.

### Features

- **The table.** Columns are LEDA ID Number, Team Name, Description, Date Established and Last Team Fee Payment. Selecting rows, the **View Team**, **Edit Team** and **Delete Team** buttons, searching, sorting, rows per page, paging, refresh and the remembered position all work as described under Places.
- **Add a team.** Click **Add Team +** and work through three steps with **Next** / **Back**, then **Submit**.
  1. **Basic Info:** **Generate LEDA ID** is ticked by default so the system assigns the next ID; untick it to type your own (an ID already in use is rejected). Enter the **Team Name** *.
  2. **Team Details:** **Established Date** * and a **Memo** for notes.
  3. **Team Members:** pick the players on the team.
- **Edit a team.** Select one row and click **Edit Team**. The same three steps appear filled in with the current details and you can click a step heading to jump to it. The LEDA ID cannot be changed, and the member list can be changed on the last step. **Skip to Update** appears once you have changed something; **Update** saves.
- **Delete teams.** Select one or more rows, click **Delete Team** and confirm.

## Team Details

![Team details page](/help-images/team-detail.png)

Shows one team's information, its members and their payment status, and opens its histories.

### Features

- **Header.** The team name and LEDA ID number.
- **Team Information card.** Established Date, Last Team Fee Payment and the memo, if any.
- **Team Member Information card.** A table with Full Name, LEDA ID, **Captain** (a star marks the captain), **Can't Be Captain**, **Bad Standing** (Yes/No) and **Payment Status**.
- **Team Actions** (the tabbed button bar):
  - **Edit Team** opens the edit form described under Teams.
  - **Add Team Payment** opens the payment form with this team already chosen (see Payments).
  - **Payment History** lists the team's payments with the date drop-down and type filter described under Place Details.
  - **Penalty History** lists penalties applied to the team: Season Code, Week, Penalty Code, Points, Notes and Team Label.
  - **League History** lists each season the team has played: Season Code, Team Label and Total Points.
  - **Show Payment Status** fills in the Payment Status column for the roster. Choose a season (the **Current Season?** box is ticked by default; untick it to pick another) and click **Show Payment Status**. Each player gets a green tick (Paid), an amber warning (Partial) or a red cross (Unpaid); hover an icon for its label. Players with no record for that season show nothing.
- **Go Back** returns to the Teams list, or to the Rosters page in Activities if you opened the team from there.

### Tips

- Loading payment status checks players one at a time, so large rosters can take a few seconds.
