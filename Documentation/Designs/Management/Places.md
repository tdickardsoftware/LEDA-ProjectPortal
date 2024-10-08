# Design for Places
The goal of this design is to implement the functionality to handle Places, i.e. Adding, editing, and deleting places.
## Creating the tables in PostgreSQL
Table name: leda_place_info

Columns: id int, name str, add1 str, add2 str, city str, state str, zip str, phoneNumber str, faxNumber str, email str, website str, establishDate date(MM-DD-YYYY), memo str, numberDartBoards int, sendMailings bool, regularSponsor bool, currentSponsor bool, issues bool, lastBarFeePayment str, lastSanctioningDate date(MM-DD-YYYY), contactId str, placeType str

*contactId links to idNumber in player table

## View Places
Once a user is on the Places page, they will be able to see a list of all places currently in our system. 

The user will also be able to search for a specific place(s) using the search bar, as the user types it will dynamically return results around what the user types

## Adding Places
On the homepage right bellow the Places header, there will be a link called Add Place, when pressed will bring you to a page to enter information about the place.

Required fields: name, add1, city, state, zip, phoneNumber, establishDate, numberDartBoards, placeType

Default Values: sendMailings = false, regularSponsor = false, currentSponsor = false, issues = false

## Editing Places
After a place has been found, and you are taken to the place where it displays all of the information, an edit button will appear in the right hand side

When clicked, all of the information will appear in text boxes and become editable, once the user clicks save it will update the data in the database

## Deleting Places
After a place has been found, and you are taken to the place where it displays all of the information, a delete button will appear in the right hand side

When clicked, a confirmation box will appear, and if confirmed the data will be deleted from the table, aswell as become removed from any current teams associated with the place.

# Markups
## Places Page
![image](../../Mockups/Management/leda_place_page.png)

## Add a place
![image](../../Mockups/Management/leda_add_place.png)
