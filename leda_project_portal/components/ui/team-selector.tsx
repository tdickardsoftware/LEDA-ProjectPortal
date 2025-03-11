"use client";

import React, { useEffect, useState } from "react";
import {
	Control,
	useFormContext,
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
import { teamRoute } from "@/lib/apiRoutes";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

// Define the form values interface
interface FormValues {
	teamLedaId: string;
    teamName: string;
}

interface DivisionSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
    selectedTeams: string[];
}

export default function TeamSelector({
	control,
	name,
	label,
    selectedTeams
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
							<DivisionSelectorContent selectedTeams={selectedTeams} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

interface DivisionSelectorContentProps {
	selectedTeams: string[];
}

const DivisionSelectorContent: React.FC<DivisionSelectorContentProps> = ({ selectedTeams }) => {
	// Use form context to get watch and setValue functions
	const { watch, setValue } = useFormContext<FormValues>();
	// Watch the memberType field value
	const teamLedaId = watch("teamLedaId");
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);
	// State to store the fetched member types
	const [teams, setTeams] = useState<
		{ value: string; label: string; name: string }[]
	>([]);

	// Fetch member types from the API endpoint
	useEffect(() => {
		async function loadTeams() {
			try {
				const response = await fetch(teamRoute);
				const data = await response.json();
                setTeams(
                    data
                        .filter((type: { ledaId: string }) => !selectedTeams.includes(type.ledaId))
                        .map((type: { ledaId: string, teamName: string }) => ({
                            value: type.ledaId,
                            label: type.ledaId + " - " + type.teamName,
                            name: type.teamName,
                        }))
                );
			} catch (error) {
				console.error("Failed to fetch member types", error);
			}
		}
		loadTeams();
	}, [selectedTeams]);

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
							{teamLedaId
								? teams.find(
										(type) => type.value === teamLedaId
								  )?.label
								: "Select a Team"}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search member type..." />
							<CommandEmpty>No division found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{teams.map((type) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												setValue("teamLedaId", type.value);
                                                setValue("teamName", type.name);
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === teamLedaId
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
