# Design for Divisions
This design is to implement the functionality to handle divisions, the user will be able to add, edit, view, and delete a division.

## Creating a Table in PostgreSQL
Table Name: leda_maint_divisions

columns: id, divisionName

*id will be used to link the divisions to the teams

## Viewing a Division
Under the maintenance header, there will be a link titled Divisions, clicking this will bring you to the divisions page. Here you will be able to see all current divisions.

If you were to select a division and click on the button of View you would be able to see the teams in that division for any season.

## Adding a Division
Once in the page to view the divisions, you can click the plus button to add a division, this will then pull up a menu to add in the required information for a division.

Required fields: divisionName

## Editing a Division
After a division has been selected an edit button will become avaliable, once clicked you can edit the name of the division.

## Deleting a Division
Once a division has been selected a delete button will become avaliable, if clicked a confirmation window will pop up, if confirmed it will delete that division