"use client";

/**
 * Penalty Selector Component
 *
 * This component provides a searchable dropdown for selecting penalties:
 * - Fetches penalty options from the API
 * - Displays penalties with their codes and descriptions
 * - Supports search functionality
 * - Integrates with React Hook Form for form handling
 *
 * The component can be used in both controlled mode (with React Hook Form)
 * or uncontrolled mode (with direct value/onChange props).
 */
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
	control: Control<any>; // Form control from React Hook Form
	name: string; // Field name in the form
	label: string; // Label text for the field
	disabled?: boolean; // Optional disabled state
}

interface PenaltySelectorContentProps {
	value?: string; // Current value (for uncontrolled mode)
	onChange?: (value: string) => void; // Change handler (for uncontrolled mode)
	disabled?: boolean; // Optional disabled state
}

/**
 * Main penalty selector component that integrates with React Hook Form
 */
export default function PenaltySelector({
	control,
	name,
	label,
	disabled,
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

/**
 * Internal content component that handles the actual selector functionality
 * Can work in both controlled (via form context) and uncontrolled modes
 */
const PenaltySelectorContent: React.FC<PenaltySelectorContentProps> = ({
	value: propValue,
	onChange,
	disabled,
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState(propValue || "");
	const [open, setOpen] = useState(false);
	const [memberTypes, setMemberTypes] = useState<
		{ value: string; label: string }[]
	>([]);

	// Determine value source (form context or props)
	const currentValue = formContext
		? formContext.watch("penaltyCode")
		: localValue;

	// Handle value changes in either mode
	const handleValueChange = (newValue: string) => {
		if (formContext) {
			formContext.setValue("penaltyCode", newValue);
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	// Fetch penalties from API on component mount
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
		// Render the dropdown selector UI
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
