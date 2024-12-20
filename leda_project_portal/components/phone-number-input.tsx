// components/phone-number-input.tsx
import React from 'react';
import Input from 'react-phone-number-input/input';
import { useController } from 'react-hook-form';

// Custom hook to integrate with react-hook-form and retrieve error state of a given field
const useShadcnFormField = (props: any) => {
  const { name, control } = props;

  const { field, fieldState } = useController({
    name,
    control,
  });

  return {
    field,
    error: fieldState.error,
  };
};

interface ShadcnPhoneNumberInputProps {
    label: string;
    name: string;
    control: any; // You might want to narrow this type if you know the specific type of control object
}

const PhoneNumberInput = ({ label, ...props }: ShadcnPhoneNumberInputProps) => {
  const { field, error } = useShadcnFormField(props);

  return (
    <div>
      <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Input
        country='US'
        {...field}
        className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
          error && 'border-red-500'
        }`}
        placeholder=""
        value={field.value || ''}
        onBlur={field.onBlur}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error?.message}</p>}
    </div>
  );
};

export default PhoneNumberInput;