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
    dateOfBirth: z.string().min(1, {message: "Date of Birth is Required."}).date()
})
//
// form function
//
export function PlayerAddInformationForm() {
    const form = useForm<z.infer<typeof playerInfoSchema>>({
        resolver: zodResolver(playerInfoSchema),
        defaultValues: {
            firstName: "",
            middleInitial: "",
            lastName: "",
            leda_id: -1,
            addrOne: "",
            addrTwo: "",
            city: "",
            state: "",
            zip: "",
            phoneNumber: "",
            otherNumber: "",
            email: "",
            gender: "",
            dateOfBirth: "1900-01-01"
        },
    })

    function onSubmit(values:z.infer<typeof playerInfoSchema>) {
        //This will be a next button not submit
        console.log("success")
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField 
                control={form.control}
                name="firstName"
                render={( {field }) => (
                    <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                            <Input placeholder='John' {...field} />
                        </FormControl>
                        <FormDescription>
                            This is the players first name.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit">Next</Button>
            </form>
        </Form>
    )
}