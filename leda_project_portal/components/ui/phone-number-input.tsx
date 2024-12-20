import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneNumberInputProps {
    name: string;
    label: string;
}

const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3, 6)}`;
    }
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

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
        const rawValue = e.target.value.replace(/\D/g, '');
        onChange(rawValue);
    };

    return (
        <div>
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                value={formatPhoneNumber(value)}
                onChange={handleChange}
                onBlur={onBlur}
                ref={ref}
            />
            {error && <p>{error.message}</p>}
        </div>
    );
};

export default PhoneNumberInput;