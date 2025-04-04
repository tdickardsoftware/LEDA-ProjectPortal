"use client"

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
import { mentionRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";

// Define the form values interface
interface FormValues {
	mentionData: JSON;
}

interface MentionSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>; // Form control from React Hook Form
	name: string; // Field name in the form
	label: string; // Label text for the field
	disabled?: boolean; // Optional disabled state
    handleMentionChange?: (value: { mentionCode: string; desc: string; points: string; mentionBasis: string }) => void; // Optional change handler
}

interface MentionSelectorContentProps {
	value?: JSON; // Current value (for uncontrolled mode)
	onChange?: (value: JSON) => void; // Change handler (for uncontrolled mode)
	disabled?: boolean; // Optional disabled state
    handleMentionChange?: (value: { mentionCode: string; desc: string; points: string; mentionBasis: string }) => void; // Optional change handler
}

/**
 * Main penalty selector component that integrates with React Hook Form
 */
export default function MentionSelector({
	control,
	name,
	label,
	disabled,
    handleMentionChange,
}: MentionSelectorProps) {
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
                                handleMentionChange={handleMentionChange} // Pass the change handler to the content component
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
const PenaltySelectorContent: React.FC<MentionSelectorContentProps> = ({
	value: propValue,
	onChange,
	disabled,
    handleMentionChange
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState(propValue || "");
	const [open, setOpen] = useState(false);
	const [memberTypes, setMemberTypes] = useState<
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ value: any; label: string }[]
	>([]);

	// Determine value source (form context or props)
	const currentValue = formContext
		? formContext.watch("mentionData")
		: localValue;

	// Handle value changes in either mode
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleValueChange = (newValue: any) => {
		if (formContext) {
			formContext.setValue("mentionData", newValue);
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	// Fetch penalties from API on component mount
	useEffect(() => {
		async function loadMentions() {
			try {
				const response = await fetch(mentionRoute);
				const data = await response.json();
				setMemberTypes(
					data.map((item: { mentionCode: string; desc: string, points: string, mentionBasis: string }) => ({
						value: item, // Store the raw object as value
						label: item.mentionCode + " - " + item.desc + " - " + item.points +"pts",
					}))
				);
			} catch (error) {
				console.error("Failed to fetch mentions", error);
			}
		}
		loadMentions();
	}, []);

	return (
		// Render the dropdown selector UI
		<div className="flex flex-col gap-4">
			<div className="w-fit">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-fit justify-between"
						>
							{currentValue
								? memberTypes.find(
										(type) => JSON.stringify(type.value) === JSON.stringify(currentValue)
								  )?.label || "Select a mention..."
								: "Select a mention..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-fit p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search place type..." />
							<CommandEmpty>No mention found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{memberTypes.map((type) => (
										<CommandItem
											key={type.label}
											value={type.label}
											onSelect={() => {
												handleValueChange(type.value); // Pass the object directly
												console.log("Selected:", type.value);
                                                handleMentionChange?.(type.value); // Call the optional change handler
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													JSON.stringify(type.value) === JSON.stringify(currentValue)
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

