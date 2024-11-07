//
//Define type to identify the shape of our data coming from postgres for players
//
export type Player = {
    id: number
    ledaId: number
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