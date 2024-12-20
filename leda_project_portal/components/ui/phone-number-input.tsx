import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';

interface PhoneNumberInputProps {
    name: string;
    label: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ name, label }) => {
    const { control } = useFormContext();
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
            <Label htmlFor={name}>{label}</Label>
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

export default PhoneNumberInput;