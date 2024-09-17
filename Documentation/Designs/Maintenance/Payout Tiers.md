# Design for Payout Tiers
this design is for a menu to view and create/edit payout tiers for different team standings.

## Creating a PostgreSQL table
table name: leda_payout_tiers
colimns: id* int, place int, ammount double

## Viewing payout tiers
Under the maintenance tab there will be a section called Payout Tiers, clicking on this will take you to a menu to view the current payout tiers.

## Creating a payout tier
While viewing the payout tiers, click the Add Payout Tier button and enter the place (cannot already exist) and the ammount, then click Add and it will create the payout tier

## Editing a payout tier
While viewing, click on a specific tier and click the edit button and it will pull up a menu to edit that payout tiers data.