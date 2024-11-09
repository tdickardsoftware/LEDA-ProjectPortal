//
//Define type to identify the shape of our data coming from postgres for players
//
export type Player = {
    ledaId: number
    fullName: string
    lastName: string
    firstName: string
    middleInitial: string
    addressOne: string
    addressTwo: string
    city: string
    state: string
    zip: string
    phoneNumber: string
    otherNumber: string
    email: string
    gender: string
    dateOfBirth: Date
}
//
//Define type to identify the shape of our data from postgres for teams
//
export type Team = {
    ledaId: number
    teamName: string
    establishedDate: Date
    memo: string
    lastTeamFeePayment: string
}