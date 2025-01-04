import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface CheckboxDefaultProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  label: string;
  className?: string;
}

const CheckboxDefault: React.FC<CheckboxDefaultProps> = ({ control, name, label, className }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='whitespace-nowrap pr-2'>{label}</FormLabel>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CheckboxDefault;
