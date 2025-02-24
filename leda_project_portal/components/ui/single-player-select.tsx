"use client";

import React, { useEffect, useState } from "react";
import {
	Control,
	FormProvider,
	useFormContext,
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
import { playerRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { TrailsDateData } from "@/lib/definitions";

interface FormValues {
	ledaId: number;
	fullName: string;
}

interface PlaceOwnerSelectProps {
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	label: string;
	trailsDateData: TrailsDateData[];
	disabled?: boolean;
}

export default function PlayerSelect({
	control,
	name,
	label,
	trailsDateData,
	disabled,
}: PlaceOwnerSelectProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={() => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<PlaceOwnerSelectContent trailsDateData={trailsDateData}  disabled={disabled}/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

interface PlaceOwnerSelectContentProps {
	trailsDateData: TrailsDateData[];
	disabled?: boolean;
}

const PlaceOwnerSelectContent: React.FC<PlaceOwnerSelectContentProps> = ({ trailsDateData, disabled }) => {
	const formContext = useFormContext<FormValues>();
	const currentValue = formContext ? formContext.watch("ledaId") : "";

	const [open, setOpen] = useState(false);
	const [players, setPlayers] = useState<{ value: string; label: string }[]>(
		[]
	);

	useEffect(() => {
		async function loadPlayers() {
			try {
				const response = await fetch(playerRoute);
				const data = await response.json();
				const filteredData = data.filter(
					(type: { ledaId: string }) =>
						!trailsDateData.some((trail) => trail.ledaId === Number(type.ledaId))
				);
				setPlayers(
					filteredData.map((type: { ledaId: string; fullName: string }) => ({
						value: type.ledaId,
						label: type.ledaId + " - " + type.fullName,
					}))
				);
			} catch (error) {
				console.error("Failed to fetch players", error);
			}
		}
		loadPlayers();
	}, [trailsDateData]);

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
								? players.find(
										(type) => Number(type.value) === currentValue
								  )?.label
								: "Select a player..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search Player..." />
							<CommandEmpty>No player found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{players.map((type) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => {
												formContext.setValue(
													"ledaId",
													Number(type.value)
												);
												formContext.setValue(
													"fullName",
													type.label.split(" - ")[1]
												);
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
