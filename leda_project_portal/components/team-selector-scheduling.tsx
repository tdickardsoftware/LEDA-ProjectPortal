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
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

// Define the form values interface
interface FormValues {
	teamId: string;
    teamName: string;
    opposingTeamId: string;
    opposingTeamName: string;
}

interface DivisionSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
    selectedTeams: string[];
    teamEntries: [string, { teamId: string; placeId: string; teamName: string }][];
    disabled? : boolean;
    defaultId?: string;
}

export default function TeamSelector({
	control,
	name,
	label,
    selectedTeams,
    teamEntries,
    disabled,
    defaultId,
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
							<DivisionSelectorContent selectedTeams={selectedTeams} teamEntries={teamEntries} disabled={disabled} defaultId={defaultId} name={name}/>
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
    teamEntries: [string, { teamId: string; placeId: string; teamName: string }][];
    disabled?: boolean;
    defaultId?: string;
	name: string;
}

const DivisionSelectorContent: React.FC<DivisionSelectorContentProps> = ({ selectedTeams, teamEntries, disabled, defaultId, name }) => {
	// Use form context to get watch and setValue functions
	const { watch, setValue } = useFormContext<FormValues>();
	// Watch the appropriate field value based on the name prop
	const fieldName = watch(name as keyof FormValues);
	// State to manage the popover open/close status
	const [open, setOpen] = useState(false);
	// State to store the filtered teams
	const [teams, setTeams] = useState<
		{ value: string; label: string; name: string }[]
	>([]);

	// Filter teams based on selectedTeams
	useEffect(() => {
		setTeams(
			teamEntries
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				.filter(([key, team]) => !selectedTeams.includes(team.teamId))
				.map(([key, team]) => ({
					value: team.teamId,
					label: `${key} - ${team.teamName}`,
					name: team.teamName,
				}))
		);
	}, [selectedTeams, teamEntries]);

	useEffect(() => {
		if (defaultId) {
			setValue(name as keyof FormValues, defaultId);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const defaultTeam = teamEntries.find(([key, team]) => team.teamId === defaultId);
			if (defaultTeam) {
				setValue(`${name}Name` as keyof FormValues, defaultTeam[1].teamName);
			}
		}
	}, [defaultId, setValue, teamEntries, name]);

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen} >
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
						>
							{fieldName
								? teams.find(
										(type) => type.value === fieldName
								  )?.label
								: "Select a Team"}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search teams..." />
							<CommandEmpty>No team found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{teams.map((type) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												setValue(name as keyof FormValues, type.value);
                                                setValue(`${name}Name` as keyof FormValues, type.name);
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === fieldName
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
