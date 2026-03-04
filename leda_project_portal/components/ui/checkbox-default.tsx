/**
 * CheckboxDefault component
 *
 * Reusable React Hook Form checkbox field that wraps the shadcn Checkbox with
 * FormField / FormLabel / FormMessage scaffolding.  Accepts a `control` prop
 * and a `name` to bind directly into the surrounding form context.
 */
import React from "react";
import { Control, FormProvider, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
	FormField,
} from "@/components/ui/form";

interface CheckboxDefaultProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
	className?: string;
	disabled?: boolean;
}

const CheckboxDefault: React.FC<CheckboxDefaultProps> = ({
	control,
	name,
	label,
	className,
	disabled,
}) => {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<FormLabel className="whitespace-nowrap pr-2">
							{label}
						</FormLabel>
						<FormControl>
							<Checkbox
								checked={field.value}
								onCheckedChange={field.onChange}
								className={className}
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
};

export default CheckboxDefault;
