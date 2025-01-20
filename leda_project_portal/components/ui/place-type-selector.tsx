"use client";

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
import { placeTypeRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";

// Define the form values interface
interface FormValues {
	placeType: string;
}

interface PlaceTypeSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	name: string;
	label: string;
}

interface PlaceTypeSelectorContentProps {
	value?: string;
	onChange?: (value: string) => void;
}

export default function PlaceTypeSelector({
	control,
	name,
	label,
}: PlaceTypeSelectorProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<PlaceTypeSelectorContent
								value={field.value}
								onChange={field.onChange}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</FormProvider>
	);
}

const PlaceTypeSelectorContent: React.FC<PlaceTypeSelectorContentProps> = ({
	value: propValue,
	onChange,
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState(propValue || "");
	const [open, setOpen] = useState(false);
	const [memberTypes, setMemberTypes] = useState<
		{ value: string; label: string }[]
	>([]);

	// Use form context if available, otherwise use props
	const currentValue = formContext
		? formContext.watch("placeType")
		: localValue;

	const handleValueChange = (newValue: string) => {
		if (formContext) {
			formContext.setValue("placeType", newValue);
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	useEffect(() => {
		async function loadPlaceTypes() {
			try {
				const response = await fetch(placeTypeRoute);
				const data = await response.json();
				setMemberTypes(
					data.map((type: { placeTypeCode: string; desc: string }) => ({
						value: type.placeTypeCode,
						label: type.placeTypeCode + " - " + type.desc,
					}))
				);
			} catch (error) {
				console.error("Failed to fetch place types", error);
			}
		}
		loadPlaceTypes();
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
						>
							{currentValue
								? memberTypes.find(
										(type) => type.value === currentValue
								  )?.label
								: "Select a place type..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search place type..." />
							<CommandEmpty>No place type found.</CommandEmpty>
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
