'use client';

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

const playerInfoSchema = z.object({
    firstName: z.string(),
    middleInitial: z.optional(z.string()),
    lastName: z.string(),
    addressOne: z.string(),
    addressTwo: z.optional(z.string()),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    phoneNumber: z.string().min(1, { message: 'Phone Number is Required' }).refine((value) => isValidPhoneNumber(value, 'US'), { message: 'Phone Number is Invalid' }),
    otherNumber: z.string().optional().refine((value) => value === '' ||  isValidPhoneNumber(value ?? '', 'US'), { message: 'Other Number is Invalid' }),
    email: z.string().min(1, { message: 'Email is Required' }).refine(validator.isEmail, { message: 'Email is Invalid' }),
    gender: z.string().min(1, { message: 'Gender is Required' }),
    dateOfBirth: z.string().optional(),
    // Membership Information
    ledaId: z.number().min(0, { message: 'LEDA ID Must be a Postive Number.' }),
    establishedDate: z.string(),
    badStanding: z.boolean(),
    badStandingReason: z.optional(z.string()),
    takeOffMailing: z.boolean(),
    mailStandings: z.boolean(),
    formOnFile: z.boolean(),
    needsMemberCard: z.boolean(),
    inactiveDate: z.optional(z.string().optional()),
    lastMembershipFeePayment: z.string().min(3).max(4),
    lastTrailsDate: z.optional(z.string()),
    memberType: z.string().min(1),
    cannotBeCaptain: z.boolean(),
    lifetimeMember: z.boolean(),
    lifetimeMemberReason: z.optional(z.string()),
});

const formContainerStyle = 'p-4 shadow-lg bg-white rounded-lg border border-gray-300';
const inputWidth = 'w-24';
const checkboxWidth = 'h-5 w-5';

export default function PlayerAddInformationForm({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void }) {
    const [generateIDStatus, setGenerateIDStatus] = useState(true);
    const [badStandingStatus, setBadStandingStatus] = useState(false);
    const [lifetimeMemberStatus, setLifetimeMemberStatus] = useState(false);
    
    const formRef = React.useRef<HTMLFormElement>(null);
    
    const form = useForm<z.infer<typeof playerInfoSchema>>({
        resolver: zodResolver(playerInfoSchema),
        defaultValues: {
            "lifetimeMember": false,
            "cannotBeCaptain": false,
            "needsMemberCard": true,
            "formOnFile": false,
            "mailStandings": false,
            "takeOffMailing": false,
            "badStanding": false,
            "lifetimeMemberReason": '',
            "otherNumber": '',
            "middleInitial": '',
            "addressTwo": '',
            "badStandingReason": '',
            "addressOne": '',
            "firstName": '',
            "lastName": '',
            "city": '',
            "state": '',
            "zip": '',
            "email": "",
            "phoneNumber": '',
            "gender": '',
            "ledaId": 0,
            "lastMembershipFeePayment": '',
            "memberType": ''
        },
    });

    async function onSubmit(values: z.infer<typeof playerInfoSchema>) {
        try {
            const response = await fetch("/api/playerPut", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            const results = await response.json();
            toast.success("Successfully submitted the form!");
            
            // Reset form and state
            form.reset();
            setGenerateIDStatus(true);
            setBadStandingStatus(false);
            setLifetimeMemberStatus(false);
            
            console.log("Form submitted successfully!", results);
            onClose(); // Close the form
            onRefresh(); // Refresh the datatable with the player API route
        } catch (error: any) {
            console.error("Form submission error", error);
            toast.error(`Failed to submit the form: ${error.message || "Please try again."}`);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mx-auto' ref={formRef}>
                <div className='flex space-x-4'>
                    {/* Player Information Section */}
                    <div className={formContainerStyle}>
                        
                        <h1>Player Information</h1>
                        <div className='flex space-x-4'>
                            <FormField
                                control={form.control}
                                name='firstName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='' {...field} type="text"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name='middleInitial'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='whitespace-nowrap'>
                                            Middle Initial
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder=''
                                                maxLength={1}
                                                className='w-10'
                                                {...field}
                                                type="text"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='lastName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Last Name' {...field} type="text"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender *</FormLabel>
                                <GenderSelector />
                                <FormMessage />
                            </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                <Input placeholder='' {...field} type='date' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='addressOne'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address One *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} type="text"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='addressTwo'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Two</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} type="text" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex space-x-4'>
                            <FormField
                                control={form.control}
                                name='city'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='' {...field} type="text" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name='state'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State *</FormLabel>
                                        <StatePicker name='state' control={form.control} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='zip'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zip Code *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='' {...field} type="text"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='email' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='phoneNumber'
                            render={() => (
                                <PhoneNumberInput label='Phone Number *' name="phoneNumber"/>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='otherNumber'
                            render={() => (
                                <PhoneNumberInput label='Other Number' name="otherNumber"/>
                            )}
                        />
                    </div>
                    
                    <div>
                        <hr className='w-px h-full my-0 bg-gray-300 border-0 dark:bg-gray-700' />
                    </div>
                    
                    {/* Membership Info Section */}
                    <div className={formContainerStyle}>
                        <h1>Membership Info</h1>
                        
                        {/* Generate ID Checkbox */}
                        <div className='flex items-start space-x-2'>
                            <Label className='whitespace-nowrap' htmlFor='generateID'>
                                Generate LEDA ID
                            </Label>
                            <Checkbox
                                checked={generateIDStatus}
                                onCheckedChange={(checked: boolean) => setGenerateIDStatus(checked)}
                                className={checkboxWidth}
                                id='generateID'
                            />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name='ledaId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder='LEDA ID #'
                                            {...field}
                                            disabled={generateIDStatus}
                                            className={inputWidth}
                                            type='number'
                                            onChange={(e) => {
                                                field.onChange(
                                                    e.target.value ? Number(e.target.value) : undefined
                                                );
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='memberType'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Member Type</FormLabel>
                                    <PlayerTypeSelector />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='establishedDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Established Date *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='date' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Bad Standing Checkbox */}
                        <FormField
                            control={form.control}
                            name="badStanding"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="badStandingCheckbox">
                                        Bad Standing
                                    </Label>
                                    <FormControl>
                                        <Checkbox
                                            id="badStandingCheckbox"
                                            checked={field.value}
                                            onCheckedChange={(checked: boolean) => {
                                                field.onChange(checked);
                                                setBadStandingStatus(checked);
                                            }}
                                            className={checkboxWidth}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='badStandingReason'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder='Reasoning...'
                                            {...field}
                                            disabled={!badStandingStatus}
                                            className='w-fit'
                                            type="text"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Lifetime Member Checkbox */}
                        <FormField
                            control={form.control}
                            name="lifetimeMember"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="lifetimeMemberCheckbox">
                                        Lifetime Member
                                    </Label>
                                    <FormControl>
                                        <Checkbox
                                            id="lifetimeMemberCheckbox"
                                            checked={field.value}
                                            onCheckedChange={(checked: boolean) => {
                                                field.onChange(checked);
                                                setLifetimeMemberStatus(checked);
                                            }}
                                            className={checkboxWidth}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='lifetimeMemberReason'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder='Reasoning...'
                                            {...field}
                                            disabled={!lifetimeMemberStatus}
                                            className='w-fit'
                                            type="text"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {/* Take Off Mailing Checkbox */}
                        <FormField
                            control={form.control}
                            name="takeOffMailing"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="takeOffMailingCheckbox">
                                        Take Off Mailing
                                    </Label>
                                    <FormControl>
                                        <Checkbox
                                            id="takeOffMailingCheckbox"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className={checkboxWidth}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Mail Standings Checkbox */}
                        <FormField
                            control={form.control}
                            name="mailStandings"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="mailStandingsCheckbox">
                                        Mail Standings
                                    </Label>
                                    <FormControl>
                                        <Checkbox
                                            id="mailStandingsCheckbox"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className={checkboxWidth}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Form on File Checkbox */}
                        <FormField
                            control={form.control}
                            name="formOnFile"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="formOnFileCheckbox">
                                        Form on File
                                    </Label>
                                    <FormControl>
                                        <Checkbox
                                            id="formOnFileCheckbox"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className={checkboxWidth}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Needs Member Card Checkbox */}
                        <FormField
                            control={form.control}
                            name="needsMemberCard"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="needsMemberCardCheckbox">
                                        Needs Member Card
                                    </Label>
                                    <FormControl>
                                        <Checkbox
                                            id="needsMemberCardCheckbox"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className={checkboxWidth}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Cannot be Captain Checkbox */}
                        <FormField
                            control={form.control}
                            name="cannotBeCaptain"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="cannotBeCaptainCheckbox">
                                        Cannot be Captain
                                    </Label>
                                    <FormControl>
                                        <Checkbox
                                            id="cannotBeCaptainCheckbox"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className={checkboxWidth}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='inactiveDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Inactive Date</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='date' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='lastMembershipFeePayment'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Membership Fee Payment *</FormLabel>
                                    <SeasonCodeSelector name='lastMembershipFeePayment'/>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='lastTrailsDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Trails Date</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} type='date' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                
                <div className='flex justify-between'>
                    <Button type='button'>Back</Button>
                    <Button type='submit'>Next</Button>
                </div>
            </form>
        </Form>
    );
}