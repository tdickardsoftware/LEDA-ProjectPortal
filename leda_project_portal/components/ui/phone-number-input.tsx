import React from 'react';
import { Control, FormProvider, useController, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface PhoneNumberInputProps {
    control: Control<any>;
    name: string;
    label: string;
}

export default function PhoneNumberInput({ control, name, label }: PhoneNumberInputProps) {
    return (
        <FormProvider {...useFormContext()}>
            <FormField control={control} name={name} render={() => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <PhoneNumberInputContent control={control} name={name} label={label} />
                    </FormControl>
                    <FormMessage />
                </FormItem> 
                
            )}/>
        </FormProvider>
    );
}


const PhoneNumberInputContent: React.FC<PhoneNumberInputProps> = ({ name, label, control }) => {
    const {
        field: { onChange, onBlur, value, ref },
        fieldState: { error },
    } = useController({
        name,
        control,
        defaultValue: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formattedValue = new AsYouType('US').input(rawValue);
        onChange(formattedValue);
    };

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

