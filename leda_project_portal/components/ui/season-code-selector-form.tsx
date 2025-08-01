// Import necessary modules and components
"use client";
import React, { useState } from "react";
import { Control, useFormContext, FormProvider } from "react-hook-form";
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
import { rosterRoute, seasonCodeRoute } from "@/lib/apiRoutes";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

// Update the interface to be more generic
interface FormValues {
	[key: string]: string; // This allows for dynamic field names
}

// Define the parameters for the SeasonCodeSelector component
interface SeasonCodeSelectorPropsContent {
	disabled?: boolean;
	name: string; // Add name prop to specify which field to watch/set
	exclusive?: boolean;
	excludeCode?: string; // Optional single season code to exclude
}

// Define the parameters for the SeasonCodeSelector component
interface SeasonCodeSelectorProps {
	disabled?: boolean;
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	label: string;
	excludeCode?: string; // Optional single season code to exclude
	exclusive?: boolean;
}

// SeasonCodeSelector component definition
export default function SeasonCodeSelector({
	control,
	name,
	disabled,
	label,
	excludeCode,
	exclusive,
}: SeasonCodeSelectorProps) {
	return (
		// Render the form field with the provided props
		<FormProvider {...useFormContext()}>
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
								excludeCode={excludeCode}
								exclusive={exclusive}
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
	excludeCode,
	exclusive,
}) => {
	const { watch, setValue } = useFormContext<FormValues>();
	const seasonCode = watch(name);
	const [open, setOpen] = useState(false);

	const { data: seasonCodes = [], isLoading: loading } = useQuery({
		queryKey: ["seasonCodes", excludeCode, exclusive],
		queryFn: async () => {
			const response = await fetch(seasonCodeRoute);
			const data = await response.json();
			let codes = data.map(
				(type: { seasonCode: string; desc: string }) => ({
					value: type.seasonCode,
					label: type.seasonCode + " - " + type.desc,
				})
			);

			let filterList: string[] = [];
			if (exclusive) {
				const response = await fetch(rosterRoute + "/rostersWithData");
				const rosterData = await response.json();
				filterList = rosterData.map(
					(item: { seasonCode: string }) => item.seasonCode
				);
			}

			if (filterList.length > 0) {
				codes = codes.filter(
					(code: { value: string; label: string }) =>
						filterList.includes(code.value)
				);
			}

			if (excludeCode) {
				codes = codes.filter(
					(code: { value: string; label: string }) =>
						code.value !== excludeCode
				);
			}

			return codes;
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={loading}>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							disabled={disabled}
						>
							{seasonCode
								? seasonCodes.find(
										(type: { value: string; label: string }) => type.value === seasonCode
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
							<CommandInput placeholder="Search season code..." />
							<CommandEmpty>No season code found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{seasonCodes.map((type: { value: string; label: string }) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												setValue(name, type.value);
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