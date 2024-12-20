'use client'

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from './ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import validator from 'validator';
import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import StatePicker from './ui/state-selector';
import GenderSelector from './ui/gender-selector';
import { toast } from 'sonner';
import PhoneNumberInput from '@/components/ui/phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import React from 'react';
import PlayerTypeSelector from './ui/player-type-selector';
import SeasonCodeSelector from './ui/season-code-selector';

const placeFormSchema = z.object({ 
    ledaId: z.number().min(0, { message: 'LEDA ID Must be a Postive Number.' }),
    name: z.string().min(1, { message: 'Name is required.' }),
    addressOne: z.string().min(1, { message: 'Address is required.' }),
    addressTwo: z.string().optional(),
    city: z.string().min(1, { message: 'City is required.' }),
    state: z.string().min(1, { message: 'State is required.' }),
    zip: z.string().min(1, { message: 'Zip is required.' }),
    phoneNumber: z.string().min(1, { message: 'Phone Number is Required' }).refine((value) => isValidPhoneNumber(value, 'US'), { message: 'Phone Number is Invalid' }),
    otherNumber: z.string().optional().refine((value) => value === '' ||  isValidPhoneNumber(value ?? '', 'US'), { message: 'Other Number is Invalid' }),
    email: z.string().min(1, { message: 'Email is Required' }).refine(validator.isEmail, { message: 'Email is Invalid' }),
    website: z.string().optional().refine((value) => value === undefined || validator.isURL(value), { message: 'Website is Invalid' }),
    establishedDate: z.string(),
    memo: z.string().optional(),
    numberOfBoards: z.number().min(0, { message: 'Number of Boards Must be a Postive Number.' }),
    sendMailings: z.boolean(),
    regularSponsor: z.boolean(),
    currentSponsor: z.boolean(),
    issues: z.boolean(),
    lastBarFeePayment: z.string(),
    lastSanctioningDate: z.string().optional(),
    placeType: z.string().min(1, { message: 'Place Type is Required' }),
});