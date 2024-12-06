//
//use client
//
'use client'
//
// imports
//
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from './ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import validator from "validator"
import { useState } from 'react'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import StatePicker from './ui/state-selector'
//
// form schema
//
const playerInfoSchema = z.object({
    firstName: z.string().min(1, {message: "First Name is Required."}),
    middleInitial: z.string().max(1, {message: "Max Length is 1."}),
    lastName: z.string().min(1, {message: "Last Name is Required."}),
    leda_id: z.number().min(0, {message: "LEDA ID Must be a Postive Number."}),
    addrOne: z.string().min(1, {message: "Address One is Required."}),
    addrTwo: z.string(),
    city: z.string().min(1, {message: "City is Required"}),
    state: z.string().min(1, {message: "State Is Required"}),
    zip: z.string().min(1, {message: "Zip Code Is Required"}),
    phoneNumber: z.string().min(1, {message: "Phone Number is Required"}).refine(validator.isMobilePhone, {message: "Phone Number is Invalid"}),
    otherNumber: z.string().refine(validator.isMobilePhone, {message: "Other Number is Invalid"}),
    email: z.string().min(1, {message: "Email is Required"}).refine(validator.isEmail, {message: "Email is Invalid"}),
    gender: z.string().min(1, {message: "Gender is Required"}),
    dateOfBirth: z.string().min(1, {message: "Date of Birth is Required."}).date(),
})
//
// form function
//
export function PlayerAddInformationForm() {
    const [generateIDStatus, setGenerateIDStatus] = useState<boolean>(false);
    const form = useForm<z.infer<typeof playerInfoSchema>>({
        resolver: zodResolver(playerInfoSchema)
    })

    function onSubmit(values:z.infer<typeof playerInfoSchema>) {
        //This will be a next button not submit
        console.log("success")
    }

    const handleCheckboxChange = (checked: boolean) => {
        setGenerateIDStatus(checked);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* LEDA ID Section */}
                <div className='flex items-start space-x-2'>
                    <Label className='whitespace-nowrap' htmlFor='generateID'>Generate LEDA ID</Label>
                    <Checkbox checked={generateIDStatus} onCheckedChange={handleCheckboxChange} className="h-5 w-5" id="generateID"/>
                </div>
                <FormField 
                control={form.control}
                name="leda_id"
                render={( { field }) => (
                    <FormItem>
                        <FormControl>
                            <Input placeholder='LEDA ID #' {...field} disabled={generateIDStatus} className='w-24' type='number'/> 
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                {/* Name Section */}
                <div className='flex space-x-4'>
                    <FormField 
                    control={form.control}
                    name="firstName"
                    render={( {field }) => (
                        <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                                <Input placeholder='John' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    name="middleInitial"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className='whitespace-nowrap'>Middle Initial</FormLabel>
                        <FormControl>
                            <Input
                            placeholder="M"
                            maxLength={1} // Ensures only 1 character is entered
                            className='w-10'
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField 
                    control={form.control}
                    name="lastName"
                    render={( {field }) => (
                        <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                                <Input placeholder='Smith' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                {/* Gender */}
                


                {/* Email */}
                <FormField 
                control={form.control}
                name="email"
                render={( {field }) => (
                    <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                            <Input placeholder='jsmith@abc.com' {...field} type='email'/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                {/* Phone Numbers */}
                <FormField 
                control={form.control}
                name="phoneNumber"
                render={( {field }) => (
                    <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                            <Input placeholder='123-456-7890' {...field} type='tel'/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField 
                control={form.control}
                name="otherNumber"
                render={( {field }) => (
                    <FormItem>
                        <FormLabel>Other Number</FormLabel>
                        <FormControl>
                            <Input placeholder='123-456-7890' {...field} type='tel'/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                {/* Address */}
                <FormField 
                control={form.control}
                name="addrOne"
                render={( {field }) => (
                    <FormItem>
                        <FormLabel>Address One</FormLabel>
                        <FormControl>
                            <Input placeholder='123 Main St.' {...field}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                                <FormField 
                control={form.control}
                name="addrTwo"
                render={( {field }) => (
                    <FormItem>
                        <FormLabel>Address Two</FormLabel>
                        <FormControl>
                            <Input placeholder='Unit 1' {...field}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <div className='flex space-x-4'>
                    <FormField 
                    control={form.control}
                    name="city"
                    render={( {field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input placeholder='New York' {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                                        <FormField 
                    control={form.control}
                    name="state"
                    render={() => (
                        <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                                <StatePicker />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                                        <FormField 
                    control={form.control}
                    name="zip"
                    render={( {field }) => (
                        <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                                <Input placeholder='12345' {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className='flex justify-between'>
                    <Button type="submit">Back</Button>
                    <Button type="submit">Next</Button>
                </div>
            </form>
        </Form>
    )
}