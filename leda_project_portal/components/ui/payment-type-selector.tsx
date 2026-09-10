/**
 * PaymentTypeSelector component
 *
 * Searchable combobox for selecting a payment type within a React Hook Form
 * context.  Fetches payment types from the API via TanStack Query.  Exposes
 * an optional `handlePaymentTypeChange` callback for parent notification.
 * The inner content component handles popover state and item rendering.
 */
"use client";

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
import { paymentTypeRoute } from "@/lib/apiRoutes";
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
	type?: PaymentType; // Changed from JSON to PaymentType to match usage
}

type PaymentType = {
	paymentType: string;
	desc: string;
};

interface PaymentTypeSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: any; // Form control from React Hook Form
	name: string; // Field name in the form
	label: string; // Label text for the field
	disabled?: boolean; // Optional disabled state
	handlePaymentTypeChange?: (value: {
		paymentType: string;
		desc: string;
	}) => void; // Optional change handler
}

interface PaymentTypeSelectorContentProps {
	value?: PaymentType;
	onChange?: (value: PaymentType) => void;
	disabled?: boolean;
	handlePaymentTypeChange?: (value: PaymentType) => void;
}

/**
 * Main payment type selector component that integrates with React Hook Form
 */
export default function PaymentTypeSelector({
	control,
	name,
	label,
	disabled,
	handlePaymentTypeChange,
}: PaymentTypeSelectorProps) {
	return (
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<PaymentTypeSelectorContent
								value={field.value}
								onChange={field.onChange}
								disabled={disabled}
								handlePaymentTypeChange={
									handlePaymentTypeChange
								} // Pass the change handler to the content component
							/>
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

/**
 * Internal content component that handles the actual selector functionality
 * Can work in both controlled (via form context) and uncontrolled modes
 */
const PaymentTypeSelectorContent: React.FC<PaymentTypeSelectorContentProps> = ({
	value: propValue,
	onChange,
	disabled,
	handlePaymentTypeChange,
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState<PaymentType | "">(
		propValue || ""
	);
	const [open, setOpen] = useState(false);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	const { data: paymentTypes = [] } = useQuery<{
		value: PaymentType;
		label: string;
	}[]>({
		queryKey: ["paymentTypes"],
		queryFn: async () => {
			const response = await fetch(paymentTypeRoute);
			const data: PaymentType[] = await response.json();
			return data.map((item) => ({
				value: item,
				label: item.paymentType + " - " + item.desc,
			}));
		},
	});

	const currentValue = formContext ? formContext.watch("type") : localValue;

	const handleValueChange = (newValue: PaymentType) => {
		if (formContext) {
			formContext.setValue("type", newValue);
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	const getSelectedPaymentType = () => {
		// If currentValue exists, try to find an exact match first
		if (currentValue) {
			// Try exact match
			const exactMatch = paymentTypes.find(
				(type) =>
					JSON.stringify(type.value) === JSON.stringify(currentValue)
			);
			if (exactMatch) return exactMatch.label;

			// If no exact match, try to match by paymentType
			if (
				currentValue &&
				typeof currentValue === "object" &&
				"paymentType" in currentValue
			) {
				const codeMatch = paymentTypes.find(
					(type) =>
						type.value.paymentType === currentValue.paymentType
				);
				if (codeMatch) return codeMatch.label;
			}
		}
		return "Select a payment type...";
	};

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (type: { value: PaymentType; label: string }) => {
		handleValueChange(type.value);
		handlePaymentTypeChange?.(type.value);
		setOpen(false);
		justClosedRef.current = true;
	};

	return (
		// Render the dropdown selector UI
		<div className="flex flex-col gap-4">
			<div className="w-fit">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							ref={popoverTriggerRef}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-fit justify-between"
							onFocus={handleFocus}
						>
							{getSelectedPaymentType()}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-fit p-0 bg-background">
						<Command>
							<CommandInput placeholder="Search payment type..." />
							<CommandEmpty>No payment type found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
									{paymentTypes.map((type) => (
										<CommandItem
											key={type.label}
											value={type.label}
											onSelect={() => handleSelect(type)}
											className="hover:bg-secondary"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													currentValue &&
														(JSON.stringify(
															type.value
														) ===
															JSON.stringify(
																currentValue
															) ||
															(typeof currentValue ===
																"object" &&
																currentValue !==
																	null &&
																"paymentType" in
																	currentValue &&
																type.value
																	.paymentType ===
																	(currentValue as PaymentType)
																		.paymentType))
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
