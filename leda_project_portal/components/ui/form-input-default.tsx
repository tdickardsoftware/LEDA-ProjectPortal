//
// use client
//
"use client";
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
import { Control, FormProvider, useFormContext } from "react-hook-form";
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
	disabled?: boolean;
}
//
// Making the form input a component
//
export function InputDefault({
	control,
	name,
	label,
	placeholder = "",
	type = "text",
	customClass,
	disabled,
}: InputDefaultProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<Input
								placeholder={placeholder}
								{...field}
								type={type}
								className={customClass}
								disabled={disabled}
								value={
									type === "date"
										? field.value?.split("T")[0]
										: field.value
								}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}
