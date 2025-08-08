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
import { placeOwnerRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

interface FormValues {
	contactId: string;
}

interface PlaceOwnerSelectProps {
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	label: string;
}

export default function PlaceOwnerSelect({
	control,
	name,
	label,
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
							<PlaceOwnerSelectContent />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
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

const PlaceOwnerSelectContent: React.FC = () => {
	const formContext = useFormContext<FormValues>();
	const currentValue = formContext ? formContext.watch("contactId") : "";
	const [open, setOpen] = useState(false);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	const { data: owners = [] } = useQuery({
		queryKey: ["placeOwners"],
		queryFn: async () => {
			const response = await fetch(placeOwnerRoute);
			const data = await response.json();
			return data.map((type: { ledaId: string; fullName: string }) => ({
				value: type.ledaId,
				label: type.ledaId + " - " + type.fullName,
			}));
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
		formContext.setValue("contactId", type.value);
		setOpen(false);
		justClosedRef.current = true;
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							ref={popoverTriggerRef}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							onFocus={handleFocus}
						>
							{currentValue
								? owners.find(
										(type: { value: string; label: string }) => type.value === currentValue
								  )?.label
								: "Select a place owner..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search place owner..." />
							<CommandEmpty>No place owner found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
									{owners.map((type: { value: string; label: string }) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => handleSelect(type)}
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