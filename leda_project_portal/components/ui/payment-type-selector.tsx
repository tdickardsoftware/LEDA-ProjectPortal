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
import { paymentTypeRoute } from "@/lib/apiRoutes";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";

// Define the form values interface
interface FormValues {
	type: JSON; // Changed from paymentTypeData to type to match form context
}

interface PaymentTypeSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>; // Form control from React Hook Form
	name: string; // Field name in the form
	label: string; // Label text for the field
	disabled?: boolean; // Optional disabled state
	handlePaymentTypeChange?: (value: {
		paymentType: string;
		desc: string;
	}) => void; // Optional change handler
}

interface PaymentTypeSelectorContentProps {
	value?: JSON; // Current value (for uncontrolled mode)
	onChange?: (value: JSON) => void; // Change handler (for uncontrolled mode)
	disabled?: boolean; // Optional disabled state
	handlePaymentTypeChange?: (value: {
		paymentType: string;
		desc: string;
	}) => void; // Optional change handler
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
								handlePaymentTypeChange={handlePaymentTypeChange} // Pass the change handler to the content component
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
const PaymentTypeSelectorContent: React.FC<PaymentTypeSelectorContentProps> = ({
	value: propValue,
	onChange,
	disabled,
	handlePaymentTypeChange,
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState(propValue || "");
	const [open, setOpen] = useState(false);
	const [paymentTypes, setPaymentTypes] = useState<
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ value: any; label: string }[]
	>([]);

	// Determine value source (form context or props)
	// Hardcoded to "type" instead of "paymentTypeData"
	const currentValue = formContext
		? formContext.watch("type")
		: localValue;

	// Handle value changes in either mode
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleValueChange = (newValue: any) => {
		if (formContext) {
			formContext.setValue("type", newValue); // Hardcoded to "type"
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	// Fetch payment types from API on component mount
	useEffect(() => {
		async function loadPaymentTypes() {
			try {
				const response = await fetch(paymentTypeRoute);
				const data = await response.json();
				setPaymentTypes(
					data.map(
						(item: {
							paymentType: string;
							desc: string;
						}) => ({
							value: item, // Store the raw object as value
							label: item.paymentType + " - " + item.desc,
						})
					)
				);
			} catch (error) {
				console.error("Failed to fetch payment types", error);
			}
		}
		loadPaymentTypes();
	}, []);

	// Find the selected payment type in the dropdown options
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

	return (
		// Render the dropdown selector UI
		<div className="flex flex-col gap-4">
			<div className="w-fit">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-fit justify-between"
						>
							{getSelectedPaymentType()}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-fit p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search payment type..." />
							<CommandEmpty>No payment type found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{paymentTypes.map((type) => (
										<CommandItem
											key={type.label}
											value={type.label}
											onSelect={() => {
												handleValueChange(type.value); // Pass the object directly
												handlePaymentTypeChange?.(
													type.value
												); // Call the optional change handler
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													// Check if current value matches this option
													currentValue &&
														(JSON.stringify(
															type.value
														) ===
															JSON.stringify(
																currentValue
															) ||
															(typeof currentValue ===
																"object" &&
																"paymentType" in
																	currentValue &&
																type.value
																	.paymentType ===
																	currentValue.paymentType))
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
