//
// use client
//
'use client'
//
// imports
//
import { z } from 'zod'
//
// Schema
//
const membershipInfoSchema = z.object({
    establishedDate: z.string().date(),
    badStanding: z.boolean(),
    badStandingReason: z.string(),
    takeOffMailing: z.boolean(),
    mailStandings: z.boolean(),
    formOnFile: z.boolean(),
    needsMemberCard: z.boolean(),
    inactiveDate: z.string().date(),
    lastMembershipFeePayment: z.string().min(3).max(4),
    lastTrailsDate: z.string().date(),
    memberType: z.string().min(1),
    cannotBeCaptain: z.boolean(),
    lifetimeMember: z.boolean(),
    lifetimeMemberReason: z.string()
})