// Import necessary modules and components
import React from 'react';
import { Control, useController, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the parameters for the PhoneNumberInput component
interface PhoneNumberInputProps {
    control: Control<any>;
    name: string;
    label: string;
}

// PhoneNumberInput component definition
export default function PhoneNumberInput({ control, name, label }: PhoneNumberInputProps) {
    return (
        // Render the form field with the provided props
        <FormField control={control} name={name} render={() => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <PhoneNumberInputContent control={control} name={name} label={label} />
                </FormControl>
                <FormMessage />
            </FormItem> 
        )}/>
    );
}

// PhoneNumberInputContent component definition
const PhoneNumberInputContent: React.FC<PhoneNumberInputProps> = ({ name, label, control }) => {
    // Use the useController hook to manage the form field state
    const {
        field: { onChange, onBlur, value, ref },
        fieldState: { error },
    } = useController({
        name,
        control,
        defaultValue: '',
    });

    // Handle input change and format the phone number
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formattedValue = new AsYouType('US').input(rawValue);
        onChange(formattedValue);
    };

    // Handle input blur and parse the phone number
    const handleBlur = () => {
        onBlur();
        const phoneNumber = parsePhoneNumberFromString(value, 'US');
        if (phoneNumber) {
            onChange(phoneNumber.nationalNumber);
        }
    };

    return (
        <div>
            <Input
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                ref={ref}
            />
            {error && <p>{error.message}</p>}
        </div>
    );
};

