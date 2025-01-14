"use client";

import React, { useState } from "react";
import { Control, FormProvider, useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

interface GenderSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
}

// Define the form values interface
interface FormValues {
	gender: string;
	customGender?: string;
}

// List of gender options
const genders = [
	{ value: "Male", label: "Male" },
	{ value: "Female", label: "Female" },
	{ value: "Other", label: "Other" },
];

export default function GenderSelector({ control, name }: GenderSelectorProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Gender *</FormLabel>
						<FormControl>
							<GenderSelectorContent
								value={field.value}
								onChange={field.onChange}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

interface GenderSelectorContentProps {
	value?: string;
	onChange?: (value: string) => void;
}

const GenderSelectorContent: React.FC<GenderSelectorContentProps> = ({
	value: propValue,
	onChange,
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState(propValue || "");
	const [open, setOpen] = useState(false);

	// Use form context if available, otherwise use props
	const currentValue = formContext ? formContext.watch("gender") : localValue;

	const handleValueChange = (newValue: string) => {
		if (formContext) {
			formContext.setValue("gender", newValue);
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
						>
							{currentValue
								? genders.find((g) => g.value === currentValue)
										?.label
								: "Select a gender..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search gender..." />
							<CommandEmpty>No gender found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{genders.map((g) => (
										<CommandItem
											key={g.value}
											value={g.value}
											onSelect={() => {
												handleValueChange(g.value);
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													g.value === currentValue
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{g.label}
										</CommandItem>
									))}
								</CommandList>
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};
