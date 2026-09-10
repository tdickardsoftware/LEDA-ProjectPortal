/**
 * DivisionSelector component
 *
 * Searchable combobox for selecting a division within a React Hook Form
 * context.  Fetches the full division list from the API via TanStack Query,
 * filters out already-selected divisions, and writes the chosen division name
 * back into the form field.  The inner content component handles popover
 * open/close state and keyboard navigation.
 */
"use client";

import React, { useState } from "react";
import { useFormContext, FormProvider } from "react-hook-form";
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
import { useQuery } from "@tanstack/react-query";

// Define the form values interface
interface FormValues {
	divisionName: string;
}

interface DivisionSelectorProps {
	control: any;
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

const DivisionSelectorContent: React.FC<DivisionSelectorContentProps> = ({
	selectedDivisions,
}) => {
	// Use form context to get watch and setValue functions
	const { watch, setValue } = useFormContext<FormValues>();
	// Watch the memberType field value
	const divisionName = watch("divisionName");
	const [open, setOpen] = useState(false);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	const { data: divisions = [] } = useQuery({
		queryKey: ["divisions", selectedDivisions],
		queryFn: async () => {
			const response = await fetch(divisionRoute);
			const data = await response.json();
			return data
				.filter(
					(type: { divisionName: string }) =>
						!selectedDivisions.includes(type.divisionName)
				)
				.map((type: { divisionName: string }) => ({
					value: type.divisionName,
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

	const handleSelect = (type: { value: string }) => {
		setValue("divisionName", type.value);
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
							{divisionName
								? divisions.find(
										(type: { value: string }) => type.value === divisionName
								  )?.value
								: "Select division"}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-background">
						<Command>
							<CommandInput placeholder="Search member type..." />
							<CommandEmpty>No division found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
									{divisions.map((type: { value: string }) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => handleSelect(type)}
											className="hover:bg-secondary"
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