# Design for Place Types
The purpose of this design is to implement the handling of Place Types and add the functionality of viewing, adding, editing, and deleting Place Types

## Create a PostgreSQL table
Table name: leda_maint_place_types

Columns: id int, placeTypeCode str, desc str

## View Place Types
Under the maintenance header there will be a link named Place Types, when clicked you will be taken to a menu which will show all of the Place Types

## Add Place Types
While in the Place Types menu, there is a button called Add, when clicked a menu will appear in which you can add information pertaining to a People Type

Required fields: placeTypeCode

## Edit Place Types
While in the Place Types menu you can click on a record, and click on the edit button which will pop up a menu and allow you to edit the Place Types

Once editing is done the user will be able to save and it will then update the database

## Delete Place Types
After you select a record in the Place Types menu you can see a delete button, clicking the delete button will pull up a confirmation prompt, if confirmed it will then delete the record from the table