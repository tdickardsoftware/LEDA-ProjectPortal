// Import necessary modules and components
"use client";
import React, { useEffect, useState } from "react";
import {
	Control,
	useFormContext,
	useForm,
	FormProvider,
} from "react-hook-form";
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
import { seasonCodeRoute } from "@/lib/apiRoutes";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

// Update the interface to be more generic
interface FormValues {
	[key: string]: string; // This allows for dynamic field names
}

// Define the parameters for the SeasonCodeSelector component
interface SeasonCodeSelectorPropsContent {
	disabled?: boolean;
	name: string; // Add name prop to specify which field to watch/set
}

// Define the parameters for the SeasonCodeSelector component
interface SeasonCodeSelectorProps {
	disabled?: boolean;
	name: string;
	control: Control<any>;
	label: string;
}

// SeasonCodeSelector component definition
export default function SeasonCodeSelector({
	control,
	name,
	disabled,
	label,
}: SeasonCodeSelectorProps) {
	return (
		// Render the form field with the provided props
		<FormProvider {...useForm<FormValues>()}>
			<FormField
				control={control}
				name={name}
				render={() => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<SeasonCodeSelectorContent
								disabled={disabled}
								name={name}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

// SeasonCodeSelectorContent component definition
const SeasonCodeSelectorContent: React.FC<SeasonCodeSelectorPropsContent> = ({
	disabled,
	name,
}) => {
	// Use form context to get watch and setValue functions
	const { watch, setValue } = useFormContext<FormValues>();
	// Watch the memberType field value
	const seasonCode = watch(name); // Use the dynamic name prop
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);
	// State to store the fetched season codes
	const [seasonCodes, setSeasonCodes] = useState<
		{ value: string; label: string }[]
	>([]);

	// Fetch season codes from the API endpoint
	useEffect(() => {
		async function loadSeasonCodes() {
			try {
				const response = await fetch(seasonCodeRoute);
				const data = await response.json();
				setSeasonCodes(
					data.map((type: any) => ({
						value: type.seasonCode,
						label: type.seasonCode + " - " + type.desc,
					}))
				);
			} catch (error) {
				console.error("Failed to fetch member types", error);
			}
		}
		loadSeasonCodes();
	}, []);

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
							disabled={disabled} // Disable the button if the prop is true
						>
							{seasonCode
								? seasonCodes.find(
										(type) => type.value === seasonCode
								  )?.label
								: "Select a season code..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-white"
						onWheel={(e) => e.stopPropagation()}
					>
						<Command>
							<CommandInput placeholder="Search member type..." />
							<CommandEmpty>No season code found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{seasonCodes.map((type) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												setValue(name, type.value); // Use the dynamic name prop
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === seasonCode
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
