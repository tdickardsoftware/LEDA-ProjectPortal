# Maintenance

Maintenance holds the lists of codes and settings used throughout the portal (divisions, mentions, payment types, payments, payout tiers, penalties, people types, place types and seasons), and is available to Office Admins and Developers only.

## Maintenance Overview

![Maintenance overview](/help-images/maintenance-overview.png)

The starting page for Maintenance, with one card for each list.

### Features

- **Cards.** Each card names a list and says what you can do with it, for example "View, Add, Edit, or Delete Mentions". Click the link at the bottom of a card (such as **View Mentions**) to open that list. The same lists are also in the sidebar under **Maintenance**.
- **What is here.** Divisions, Mentions, Payment Types, Payments, Payout Tiers, Penalties, People Types, Place Types and Seasons.

### Tips

- These values are used by Activities and by player, team and place records, so change them with care.

## Divisions

![Divisions page](/help-images/divisions.png)

![Add Division dialog](/help-images/divisions-add.png)

The list of division names used when building the league.

### Features

- **The table.** One column, **Division**. Tick the checkbox at the start of a row to select it; the checkbox in the header selects every row on the page.
- **Add a division.** Click **Add Division +**, type the **Division Name** * and click **Add**. If the name is already used you will see "Division name already exists."
- **Delete divisions.** Select one or more rows and click **Delete Division(s)**. A box asks "Are you sure you want to delete N row(s)?". Click **Delete** to confirm or **Cancel** to back out. The button stays greyed out until at least one row is selected.
- **No editing.** Divisions can only be added or deleted. To change a name, add the new one and delete the old one.
- **Search.** Type in the **Search...** box, then press **Enter** or click **Search** (the list is not filtered while you type). Click **Clear** or press **Esc** to show everything again. Matching is forgiving, so small typos still find results.
- **Searching a specific column.** Write the column name in quotes, an equals sign and the value, for example `"Division"="Open"`, and join conditions with `and` / `or`. Shortcuts: right-click a column heading and choose **Add "Column" to search**, or right-click a cell and choose **Search for exact match** or **Search for all records containing**.
- **Rows per page.** Use the drop-down next to the refresh button to show 10, 25, 50 or 100 rows, and **Previous** / **Next** under the table to change page.
- **Refresh.** Click the circular-arrow button to reload the list; it also clears any selected rows.

## Mentions

![Mentions page](/help-images/mentions.png)

![Add Mention dialog](/help-images/mentions-add.png)

The list of mentions (awards) that can be given to players, with their points.

### Features

- **The table.** Columns are **Mention Code**, **Description**, **Points** and **Mention Basis**. Selecting rows, searching, rows per page, paging and refresh work as described under Divisions.
- **Add a mention.** Click **Add Mention +** and fill in the form, then click **Add**.
  - **Mention Code** * – the short code. If it already exists you will see "Mention code already exists".
  - **Points** * – a number of zero or more.
  - **Mention Basis** * – choose **NONE**, **LOW** or **HIGH** from the list.
  - **Description** – optional notes.
- **Edit a mention.** Select exactly one row and click **Edit Mention**. Change the Points, Mention Basis or Description and click **Update**. The Mention Code is locked and cannot be changed.
- **Delete mentions.** Select one or more rows, click **Delete Mention(s)** and confirm.

## Payment Types

![Payment Types page](/help-images/payment-types.png)

![Add Payment Type dialog](/help-images/payment-types-add.png)

The categories a payment can belong to, such as the different league fees.

### Features

- **The table.** Columns are **Payment Type** and **Description**. Selecting rows, searching, rows per page, paging and refresh work as described under Divisions.
- **Add a payment type.** Click **Add Payment Type +**, enter the **Payment Type** * and an optional **Description**, then click **Add**. A duplicate name is rejected.
- **Edit a payment type.** Select exactly one row and click **Edit Payment Type**. You can change the Description; the Payment Type name is locked. Click **Update** to save.
- **Delete payment types.** Select one or more rows, click **Delete Payment Type(s)** and confirm.

### Tips

- These are the choices offered in the **Payment Category** box when you record a payment (see Payments).

## Payments

![Payments page](/help-images/payments.png)

Look up, add, correct and remove payments for players, teams and places across the whole league.

### Features

- **Three tabs.** **Player**, **Team** and **Place** each show that group's payments. The portal remembers the tab you used last and opens it next time.
- **The table.** Columns are **Payment #**, **LEDA ID**, **Name**, **Amount**, **Date**, **Type**, **Season** and **Actions**. It is listed by Payment # to start with. Unlike the other lists, you do not tick rows here; the buttons are on each row.
- **Search.** Type in the **Search...** box; results update by themselves a moment after you stop typing, or immediately on **Enter**. Press **Esc** or click **Clear** to remove the search. You can narrow by one column using the same `"Column"="value"` style and the right-click shortcuts described under Divisions.
- **Rows per page, paging and refresh.** Use the drop-down (10, 25, 50 or 100 rows), **Previous** / **Next** and the circular-arrow refresh button, as in Players.
- **Add a payment.** Click **Add Player Payment**, **Add Team Payment** or **Add Place Payment** (depending on the tab). Fill in the form and click **Save Payment**:
  - **Player / Team / Place** – search for and choose who the payment is for.
  - **Season** * – the season the payment applies to.
  - **Payment Category** – the payment type (see Payment Types).
  - **Payment Type** – **Full** or **Partial** (Full is the default).
  - **Amount** – the dollar amount. Leave it blank to record 0.00.
  - **Date** * – the payment date; it starts as today.
  - **Notes** – anything worth remembering.
  - **Complimentary** – tick if the fee was waived or comped.
  - **Paid Off** – ticked by default; untick if the balance is still owing.
- **Row actions.** Each row has three icon buttons:
  - **Eye** opens **Payment Details** with every field (Payment #, LEDA ID, Name, Amount, Date, Type, Payment Type, Season Code, Fiscal Year, Comp, Paid Off and Notes). It also has **Edit** and **Delete** buttons.
  - **Pencil** opens the same form as adding, filled in with the payment. Click **Update Payment** to save.
  - **Red X** deletes the payment after you confirm in a pop-up ("This action cannot be undone.").

### Tips

- Payments can also be added from a person's, team's or place's detail page, where the person, team or place is already filled in.
- After saving, the list refreshes by itself.

## Payout Tiers

![Payout Tiers page](/help-images/payout-tiers.png)

![Add Payout Tier dialog](/help-images/payout-tiers-add.png)

The table of prize amounts for each finishing place.

### Features

- **The table.** Columns are **Place** and **Amount Won**. Selecting rows, searching, rows per page, paging and refresh work as described under Divisions.
- **Add a payout tier.** Click **Add Payout Tier +**, enter the **Place** * (a number, for example 1 for first place) and the amount (the box is labelled **Points** *, a number of zero or more), then click **Add**. If that place already has a tier you will see "This Place Already Exists".
- **Edit a payout tier.** Select exactly one row and click **Edit Payout Tier**. Only the amount can be changed; the Place is locked. Click **Update** to save.
- **Delete payout tiers.** Select one or more rows, click **Delete Payout Tier(s)** and confirm.

## Penalties

![Penalties page](/help-images/penalties.png)

![Add Penalty dialog](/help-images/penalties-add.png)

The list of penalty codes that can be applied to teams.

### Features

- **The table.** Columns are **Penalty Code** and **Description**. Selecting rows, searching, rows per page, paging and refresh work as described under Divisions.
- **Add a penalty.** Click **Add Penalty +**, enter the **Penalty Code** * and an optional **Description**, then click **Add**. A code that already exists is rejected.
- **Edit a penalty.** Select exactly one row and click **Edit Penalty**. Only the Description can be changed; the code is locked. Click **Update** to save.
- **Delete penalties.** Select one or more rows, click **Delete Penalty** and confirm.

## People Types

![People Types page](/help-images/people-types.png)

![Add People Type dialog](/help-images/people-types-add.png)

The list of people type codes used on player and contact records.

### Features

- **The table.** Columns are **People Type Code** and **Description**. Selecting rows, searching, rows per page, paging and refresh work as described under Divisions.
- **Add a people type.** Click **Add People Type +**, enter the **People Type Code** * and an optional **Description**, then click **Add**. A code that already exists is rejected.
- **Edit a people type.** Select exactly one row and click **Edit People Type**. Only the Description can be changed; the code is locked. Click **Update** to save.
- **Delete people types.** Select one or more rows, click **Delete People Type(s)** and confirm.

### Tips

- The Member Type list shown when adding or editing a player comes from these codes.

## Place Types

![Place Types page](/help-images/place-types.png)

![Add Place Type dialog](/help-images/place-types-add.png)

The list of place type codes (for example the kinds of venue) used on place records.

### Features

- **The table.** Columns are **Place Type Code** and **Description**. Selecting rows, searching, rows per page, paging and refresh work as described under Divisions.
- **Add a place type.** Click **Add Place Type +**, enter the **Place Type Code** * and an optional **Description**, then click **Add**. A code that already exists is rejected.
- **Edit a place type.** Select exactly one row and click **Edit Place Type**. Only the Description can be changed; the code is locked. Click **Update** to save.
- **Delete place types.** Select one or more rows, click **Delete Place Type(s)** and confirm.

### Tips

- These are the choices offered in the **Place Type** box when adding or editing a place.

## Seasons

![Seasons page](/help-images/seasons.png)

![Add Season dialog](/help-images/seasons-add.png)

The list of league seasons, each with its code, fiscal year and weekly game dates.

### Features

- **The table.** Columns are **Season Code**, **Description**, **Fiscal Year** and **Current Season**. Select rows with the checkboxes. **View Season**, **Edit Season** and **Delete Season(s)** work on the selected rows (View and Edit need exactly one).
- **Search, paging and refresh.** Type in the **Search...** box (results update a moment after you stop typing, or on **Enter**; **Esc** or **Clear** removes it). Use the drop-down for 10, 25, 50 or 100 rows, **Previous** / **Next** to change page, and the circular-arrow button to refresh. Right-click shortcuts for column searches work as described under Divisions. Your page and search are remembered when you open a season and come back.
- **View Calendar.** Opens the Season Calendar page for blocked dates.
- **Add a season.** Click **Add Season +** and fill in the form, then click **Add**.
  - **Season Code** * – if it already exists you will see "Season Code already exists".
  - **Fiscal Year** *.
  - **Current Season** – ticked by default.
  - **Description** – optional notes.
  - **Automatically generate dates** (ticked by default) – set **How Many Weeks?** (14 to start, up to 54) and the **Initial Date**. The system lists one date per week as tiles under **Generated Dates**, skipping any day blocked on the Season Calendar. To change a tile, hover over it and pick a new date; the later dates move to stay one week apart.
  - **Manual dates** – untick **Automatically generate dates**, then click **Add Date** for each game date and hover over a tile to choose its date. Every tile must have a date before you can add the season.
- **Edit a season.** Select one row and click **Edit Season**. You can change the Fiscal Year, Current Season and Description, and hover over any of the **Existing Dates** tiles to pick a new date (blocked dates cannot be chosen). Click **Update** to save. Dates cannot be added or removed here.
- **Delete seasons.** Select one or more rows, click **Delete Season(s)** and confirm.

### Tips

- Fill in the Season Calendar before adding a season so the automatic dates skip holidays and other blocked days.

## Season Calendar

![Season Calendar page](/help-images/season-calendar.png)

A calendar of blocked dates, which are days with no league matchups (such as holidays).

### Features

- **Open it.** Click **View Calendar** on the Seasons page.
- **Calendar views.** Switch between **month**, **week**, **day** and **agenda** views, and move forward or back to any year. Each blocked date appears as an entry showing its description.
- **Add a blocked date.** Click **Add Date**, pick the **Date** * and type a **Description** * (for example "Tournament Day"), then click **Add Date**. Both are required. Dates that are already blocked cannot be picked again.
- **See the full list.** Click the **N dates blocked** badge to open a list of every blocked date for the year being viewed, with its description, sorted by date. Click **Close** when done.
- **Remove a blocked date.** Hover over an entry on the calendar, or over a row in the list, and click the trash-can icon. Confirm in the **Delete Blocked Date?** box; this cannot be undone.

### Tips

- Blocked dates are used when season dates are generated or picked, so add them before creating a season.

## Season Details

Shows everything recorded for a single season and lets you edit it in place.

### Features

- **Open it.** Select one season on the Seasons page and click **View Season**.
- **Header.** The season description and Season Code.
- **Season Information card.** Fiscal Year and whether it is the current season.
- **Season Date Information card.** Every game date for the season (Date 1, Date 2 and so on).
- **Edit Season.** Click the button at the top right to switch the page to the edit form described under Seasons. **Back** returns to the details, and **Update** saves and refreshes the page.
- **Go Back.** Returns to the Seasons list.

### Tips

- If you see a "not found" page, the season code in the address does not exist; return to the Seasons list and use **View Season**.
