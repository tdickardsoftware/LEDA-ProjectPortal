//
// use client
//
'use client'
//
// imports
//
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
//
// Define the parameters
//
interface InputDefaultProps {
    control: Control<any>;
    name: string;
    label: string;
    placeholder?: string;
    type?: string;
    customClass?: string;
}
//
// Making the form input a component
//
export function InputDefault({
    control,
    name,
    label,
    placeholder = '',
    type = 'text',
    customClass,
}: InputDefaultProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <Input placeholder={placeholder} {...field} type={type} className={customClass}/>
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
    );
}