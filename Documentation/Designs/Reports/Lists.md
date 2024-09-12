# Design for Lists
This is the design to implement the reports for the list section

## Members
Under the Reports Tab under the Lists subsection, you will find a link named Members. When clicked on it will prompt the user to select if they want to select a roster, division(s), and subdivision OR General Membership, and select a from date to a date (current date is default)
You can also filter by if they are in Good Standing/Bad Standing or if they are Honorary 

Once generated it will display the names, LEDA id, Division Code (D1H), phone number, email, and address information

## New Members
Under the Reports Tab under the Lists subsection, you will find a link named New Members, here you will be able to set a Member Since date, so say you wanted all players joined in the month of august to now, you would select the date 8/1/2024 and select an end date of current date.

You can then filter by good/bad standing or if they are honorary.

The report will output their name, leda id and join date

## Places
Under the Reports Tab under the Lists subsection, you will find a link named Places, here you will be able to select either a general list (all places) or a season list (all places in a season). 

If the user selects season they will have to input the season.

It will then output all places/places in a season, with their placeId, name, contactName, phoneNumber, email, and address information

## Teams
Under the Reports Tab under the Lists subsection, you will find a link named Teams, here you will be able to select either a general list (all teams) or a season list (all teams in a season)

If the user selects season they will have to input the season.

It will then output all teams/teams in a seaon, with their teamId, team name, last captain name, and last bar location

## Captains
Under the Reports Tab under the Lists subsection, you will find a link named Captains, from there you will then need to select a season, then you can select a division or a subdivision (default is all divisions/subdivisions)

After this is selected it will generate a report of all captains names, their id's, their team name, and home bar location, and their division (D1H)

## Election List
Under the Reports Tab under the Lists subsection, you will find a link named Election List

The user will then see the ability to filter by good/bad standing and then be able to enter the fiscal year (2122)

It will then show all users that are in good/bad standing and have a report containing their name, abs ballot send, abs ballot recieved, and voted

## Mailing Labels
Under the Reports Tab under the Lists subsection, you will find a link named Mailing Labels, you will be prompted to generate them by name or by zipcode
*DO NOT GENERATE A MAILING LABEL FOR SOMEBODY WITH NO ZIPCODE

By name it will generate mailing labels alphabetically, by zipcode it will generate them by the lowest zipcode first for each player that has not been removed from mailing list