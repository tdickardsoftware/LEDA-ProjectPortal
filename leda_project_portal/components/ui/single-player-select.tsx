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
import { playerRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { TrailsDateData } from "@/lib/definitions";
import { useQuery } from "@tanstack/react-query";

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
							<PlaceOwnerSelectContent
								trailsDateData={trailsDateData}
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

interface PlaceOwnerSelectContentProps {
	trailsDateData: TrailsDateData[];
	disabled?: boolean;
}

// Utility hook to track last input type (keyboard or mouse)
function useLastInputType() {
	const [lastInputType, setLastInputType] = React.useState<"keyboard" | "mouse" | null>(null);

	React.useEffect(() => {
		const handleKeyDown = () => setLastInputType("keyboard");
		const handleMouseDown = () => setLastInputType("mouse");
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("mousedown", handleMouseDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("mousedown", handleMouseDown);
		};
	}, []);

	return lastInputType;
}

const PlaceOwnerSelectContent: React.FC<PlaceOwnerSelectContentProps> = ({
	trailsDateData,
	disabled,
}) => {
	const formContext = useFormContext<FormValues>();
	const currentValue = formContext ? formContext.watch("ledaId") : "";
	const [open, setOpen] = useState(false);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	const { data: players = [] } = useQuery({
		queryKey: ["players", trailsDateData],
		queryFn: async () => {
			const response = await fetch(playerRoute);
			const data = await response.json();
			const filteredData = data.filter(
				(type: { ledaId: string }) =>
					!trailsDateData.some(
						(trail) => Number(trail.ledaId) === Number(type.ledaId)
					)
			);
			return filteredData.map(
				(type: { ledaId: string; fullName: string }) => ({
					value: type.ledaId,
					label: type.ledaId + " - " + type.fullName,
				})
			);
		},
	});

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (type: { value: string; label: string }) => {
		formContext.setValue("ledaId", Number(type.value));
		formContext.setValue("fullName", type.label.split(" - ")[1]);
		setOpen(false);
		justClosedRef.current = true;
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							ref={popoverTriggerRef}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							onFocus={handleFocus}
						>
							{currentValue
								? players.find(
										(type: { value: string; label: string }) =>
											Number(type.value) === currentValue
								  )?.label
								: "Select a player..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-background">
						<Command>
							<CommandInput placeholder="Search Player..." />
							<CommandEmpty>No player found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
									{players.map((type: { value: string; label: string }) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => handleSelect(type)}
											className="hover:bg-secondary"
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
