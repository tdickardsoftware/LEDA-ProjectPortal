"use client";

import React, { useEffect, useState } from "react";
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
import { penaltyRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";

// Define the form values interface
interface FormValues {
	penaltyCode: string;
}

interface PenaltySelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
    disabled?: boolean;
}

interface PenaltySelectorContentProps {
	value?: string;
	onChange?: (value: string) => void;
    disabled?: boolean;
}

export default function PenaltySelector({
	control,
	name,
	label,
    disabled
}: PenaltySelectorProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<PenaltySelectorContent
								value={field.value}
								onChange={field.onChange}
                                disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

const PenaltySelectorContent: React.FC<PenaltySelectorContentProps> = ({
	value: propValue,
	onChange,
    disabled
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState(propValue || "");
	const [open, setOpen] = useState(false);
	const [memberTypes, setMemberTypes] = useState<
		{ value: string; label: string }[]
	>([]);

	// Use form context if available, otherwise use props
	const currentValue = formContext
		? formContext.watch("penaltyCode")
		: localValue;

	const handleValueChange = (newValue: string) => {
		if (formContext) {
			formContext.setValue("penaltyCode", newValue);
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	useEffect(() => {
		async function loadPenalties() {
			try {
				const response = await fetch(penaltyRoute);
				const data = await response.json();
				setMemberTypes(
					data.map((type: { penaltyCode: string; desc: string }) => ({
						value: type.penaltyCode + " - " + type.desc,
						label: type.penaltyCode + " - " + type.desc,
					}))
				);
			} catch (error) {
				console.error("Failed to fetch penalties", error);
			}
		}
		loadPenalties();
	}, []);

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
						>
							{currentValue
								? memberTypes.find(
										(type) => type.value === currentValue
								  )?.label
								: "Select a penalty..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search place type..." />
							<CommandEmpty>No penalty found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{memberTypes.map((type) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												handleValueChange(type.value);
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === currentValue
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{type.label}
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
