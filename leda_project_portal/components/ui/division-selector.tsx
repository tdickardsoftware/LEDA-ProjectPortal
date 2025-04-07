"use client";

import React, { useEffect, useState } from "react";
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
import { divisionRoute } from "@/lib/apiRoutes";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

// Define the form values interface
interface FormValues {
	divisionName: string;
}

interface DivisionSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
	selectedDivisions: string[];
}

export default function DivisionSelector({
	control,
	name,
	label,
	selectedDivisions,
}: DivisionSelectorProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={() => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<DivisionSelectorContent
								selectedDivisions={selectedDivisions}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

interface DivisionSelectorContentProps {
	selectedDivisions: string[];
}

const DivisionSelectorContent: React.FC<DivisionSelectorContentProps> = ({
	selectedDivisions,
}) => {
	// Use form context to get watch and setValue functions
	const { watch, setValue } = useFormContext<FormValues>();
	// Watch the memberType field value
	const divisionName = watch("divisionName");
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);
	// State to store the fetched member types
	const [divisions, setDivisions] = useState<{ value: string }[]>([]);

	// Fetch member types from the API endpoint
	useEffect(() => {
		async function loadDivisions() {
			try {
				const response = await fetch(divisionRoute);
				const data = await response.json();
				setDivisions(
					data
						.filter(
							(type: { divisionName: string }) =>
								!selectedDivisions.includes(type.divisionName)
						)
						.map((type: { divisionName: string }) => ({
							value: type.divisionName,
						}))
				);
			} catch (error) {
				console.error("Failed to fetch member types", error);
			}
		}
		loadDivisions();
	}, [selectedDivisions]);

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
							{divisionName
								? divisions.find(
										(type) => type.value === divisionName
								  )?.value
								: "Select division"}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search member type..." />
							<CommandEmpty>No division found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{divisions.map((type) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												setValue(
													"divisionName",
													type.value
												);
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === divisionName
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{type.value}
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
