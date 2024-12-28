'use client'

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import validator from 'validator';
import {useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import StatePicker from '@/components/ui/state-selector';
import { toast } from 'sonner';
import PhoneNumberInput from '@/components/ui/phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import React from 'react';
import SeasonCodeSelector from '@/components/ui/season-code-selector';
import PlaceTypeSelector from '@/components/ui/place-type-selector';
import { Textarea } from "@/components/ui/textarea"
import PlaceOwnerSelector from '@/components/ui/place-owner-select';
import { InputDefault } from '../ui/form-input-default';

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
    establishDate: z.string(),
    memo: z.string().optional(),
    numberOfBoards: z.number().min(0, { message: 'Number of Boards Must be a Postive Number.' }),
    sendMailings: z.boolean(),
    regularSponsor: z.boolean(),
    currentSponsor: z.boolean(),
    issues: z.boolean(),
    lastBarFeePayment: z.string(),
    lastSanctioningDate: z.string().optional(),
    placeType: z.string().min(1, { message: 'Place Type is Required' }),
    contactId: z.string().min(1, { message: 'Place Owner is Required' }),
});

const formContainerStyle = 'p-4 shadow-lg bg-white rounded-lg border border-gray-300';
const inputWidth = 'w-24';
const checkboxWidth = 'h-5 w-5';

export default function PlaceAddForm({ onClose, onRefresh }: { onClose: () => void, onRefresh: () => void })  {
    const [generateIDStatus, setGenerateIDStatus] = useState(true);

    const form = useForm<z.infer<typeof placeFormSchema>>({ 
        resolver: zodResolver(placeFormSchema),
        defaultValues: {
            ledaId: undefined,
            name: '',
            addressOne: '',
            addressTwo: '',
            city: '',
            state: '',
            zip: '',
            phoneNumber: '',
            otherNumber: '',
            email: '',
            website: '',
            establishDate: '',
            memo: '',
            numberOfBoards: 0,
            sendMailings: false,
            regularSponsor: false,
            currentSponsor: false,
            issues: false,
            lastBarFeePayment: '',
            lastSanctioningDate: '',
            placeType: '',
            contactId: '',
        }
    });

    async function onSubmit(values: z.infer<typeof placeFormSchema>) {
            try {
                const submissionValues = generateIDStatus 
                    ? { ...values, ledaId: 0 }
                    : values;

                const response = await fetch("/api/place/placePut", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(submissionValues),
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
                
                console.log("Form submitted successfully!", results);
                onClose(); // Close the form
                onRefresh(); // Refresh the datatable with the place API route
            } catch (error: any) {
                console.error("Form submission error", error);
                toast.error(`Failed to submit the form: ${error.message || "Please try again."}`);
            }
        }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mx-auto'>
                <div className='flex space-x-4'>
                    <div className={formContainerStyle}>
                        <h1>Place Information</h1>
                        <hr className='bg-gray-300'></hr>
                        <InputDefault control={form.control} name='name' label='Name of Place *' />
                        <InputDefault control={form.control} name='website' label='Website *' />
                        <FormField
                            control={form.control}
                            name='numberOfBoards'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of Boards *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Number of Boards...'
                                            {...field}
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
                        <InputDefault control={form.control} name='addressOne' label='Address One *' />
                        <InputDefault control={form.control} name='addressTwo' label='Address Two' />
                        <div className='flex space-x-4'>
                            <InputDefault control={form.control} name='city' label='City *' />
                            <InputDefault control={form.control} name='state' label='State *' />
                            <InputDefault control={form.control} name='zip' label='Zip Code *' />
                        </div>
                        <InputDefault control={form.control} name='email' label='Email *' type='email'/>
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

                    <div className={formContainerStyle}>
                        <h1>Place Membership Info</h1>
                        <hr className='bg-gray-300'></hr>
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
                            name='contactId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Place Owner *</FormLabel>
                                    <PlaceOwnerSelector />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='lastBarFeePayment'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Bar Fee Payment *</FormLabel>
                                    <SeasonCodeSelector name='lastBarFeePayment'/>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='placeType'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Place Type *</FormLabel>
                                    <PlaceTypeSelector />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <InputDefault control={form.control} name='establishDate' label='Established Date *' type='date'/>
                        <InputDefault control={form.control} name='lastSanctioningDate' label='Last Sanctioning Date *'  type='date'/>
                        <FormField
                            control={form.control}
                            name="sendMailings"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="takeOffMailingCheckbox">
                                        Send Mailings
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
                        <FormField
                            control={form.control}
                            name="regularSponsor"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="takeOffMailingCheckbox">
                                        Regular Sponsor
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
                        <FormField
                            control={form.control}
                            name="currentSponsor"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="takeOffMailingCheckbox">
                                        Current Sponsor
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
                        <FormField
                            control={form.control}
                            name="issues"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='whitespace-nowrap pr-2' htmlFor="takeOffMailingCheckbox">
                                        Issues
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
                        <FormField
                            control={form.control}
                            name='memo'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Memo *</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional Data Here..." {...field} />
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
};