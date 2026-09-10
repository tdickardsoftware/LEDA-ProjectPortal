"use client";

/**
 * Penalty Selector Component
 *
 * This component provides a searchable dropdown for selecting penalties:
 * - Fetches penalty options from the API
 * - Displays penalties with their codes and descriptions
 * - Supports search functionality
 * - Integrates with React Hook Form for form handling
 *
 * The component can be used in both controlled mode (with React Hook Form)
 * or uncontrolled mode (with direct value/onChange props).
 */
import React, { useState } from "react";
import { FormProvider, useFormContext } from "react-hook-form";
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
import { penaltyRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

// Define the form values interface
interface FormValues {
	penaltyCode: string;
}

interface PenaltySelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: any; // Form control from React Hook Form
	name: string; // Field name in the form
	label: string; // Label text for the field
	disabled?: boolean; // Optional disabled state
}

type PenaltyType = {
	penaltyCode: string;
	desc: string;
};

interface PenaltySelectorContentProps {
	value?: string;
	onChange?: (value: string) => void;
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

/**
 * Main penalty selector component that integrates with React Hook Form
 */
export default function PenaltySelector({
	control,
	name,
	label,
	disabled,
}: PenaltySelectorProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<PenaltySelectorContent
								value={field.value}
								onChange={field.onChange}
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

/**
 * Internal content component that handles the actual selector functionality
 * Can work in both controlled (via form context) and uncontrolled modes
 */
const PenaltySelectorContent: React.FC<PenaltySelectorContentProps> = ({
	value: propValue,
	onChange,
	disabled,
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState(propValue || "");
	const [open, setOpen] = useState(false);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	const { data: memberTypes = [] } = useQuery<{ value: string; label: string }[]>({
		queryKey: ["penalties"],
		queryFn: async () => {
			const response = await fetch(penaltyRoute);
			const data: PenaltyType[] = await response.json();
			return data.map((type) => ({
				value: type.penaltyCode + " - " + type.desc,
				label: type.penaltyCode + " - " + type.desc,
			}));
		},
	});

	const currentValue = formContext
		? formContext.watch("penaltyCode")
		: localValue;

	const handleValueChange = (newValue: string) => {
		if (formContext) {
			formContext.setValue("penaltyCode", newValue);
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (type: { value: string; label: string }) => {
		handleValueChange(type.value);
		setOpen(false);
		justClosedRef.current = true;
	};

	return (
		// Render the dropdown selector UI
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
								? memberTypes.find(
										(type) => type.value === currentValue
								  )?.label
								: "Select a penalty..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-background">
						<Command>
							<CommandInput placeholder="Search place type..." />
							<CommandEmpty>No penalty found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
									{memberTypes.map((type) => (
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