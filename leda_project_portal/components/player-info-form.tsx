//
//use client
//
'use client'
//
// imports
//
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
//
// form schema
//
const playerInfoSchema = z.object({
    firstName: z.string().min(1),
    middleInitial: z.string().max(1),
    lastName: z.string().min(1),
    leda_id: z.number(),
    addrOne: z.string().min(1),
    addrTwo: z.string(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    phoneNumber: z.string().min(1).max(10),
    otherNumber: z.string().max(10),
    email: z.string().min(1),
    gender: z.string().min(1),
    dateOfBirth: z.date(),
})

