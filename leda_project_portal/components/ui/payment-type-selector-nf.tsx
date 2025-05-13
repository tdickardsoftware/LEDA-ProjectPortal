"use client";

import React, { useEffect, useState } from "react";
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

// Props for the non-form payment type selector
interface PaymentTypeSelectorNFProps {
	value?: { paymentType: string; desc: string };
	onChange?: (value: { paymentType: string; desc: string }) => void;
	label: string;
	disabled?: boolean;
	handlePaymentTypeChange?: (value: {
		paymentType: string;
		desc: string;
	}) => void;
}

const PaymentTypeSelectorNF: React.FC<PaymentTypeSelectorNFProps> = ({
	value: propValue,
	onChange,
	label,
	disabled,
	handlePaymentTypeChange,
}) => {
	const [open, setOpen] = useState(false);
	const [paymentTypes, setPaymentTypes] = useState<
		{ value: { paymentType: string; desc: string }; label: string }[]
	>([]);
	const [localValue, setLocalValue] = useState<
		{ paymentType: string; desc: string } | undefined
	>(propValue);

	// Keep localValue in sync with propValue if controlled
	useEffect(() => {
		if (propValue !== undefined) {
			setLocalValue(propValue);
		}
	}, [propValue]);

	const handleValueChange = (newValue: {
		paymentType: string;
		desc: string;
	}) => {
		setLocalValue(newValue);
		onChange?.(newValue);
		handlePaymentTypeChange?.(newValue);
		setOpen(false);
	};

	useEffect(() => {
		async function loadPaymentTypes() {
			try {
				const response = await fetch(paymentTypeRoute);
				const data = await response.json();
				setPaymentTypes(
					data.map((item: { paymentType: string; desc: string }) => ({
						value: item,
						label: item.paymentType + " - " + item.desc,
					}))
				);
			} catch (error) {
				console.error("Failed to fetch payment types", error);
			}
		}
		loadPaymentTypes();
	}, []);

	const getSelectedPaymentType = () => {
		if (localValue) {
			const exactMatch = paymentTypes.find(
				(type) =>
					JSON.stringify(type.value) === JSON.stringify(localValue)
			);
			if (exactMatch) return exactMatch.label;
			if (typeof localValue === "object" && "paymentType" in localValue) {
				const codeMatch = paymentTypes.find(
					(type) => type.value.paymentType === localValue.paymentType
				);
				if (codeMatch) return codeMatch.label;
			}
		}
		return "Select a payment type...";
	};

	return (
		<div className="flex flex-col gap-4">
			<label className="font-medium">{label}</label>
			<div className="w-fit">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={disabled}>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-fit justify-between border-gray-400 text-gray-700"
						>
							{getSelectedPaymentType()}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-fit p-0 bg-white border-gray-400 text-gray-700">
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
												handleValueChange(type.value);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													localValue &&
														(JSON.stringify(
															type.value
														) ===
															JSON.stringify(
																localValue
															) ||
															(typeof localValue ===
																"object" &&
																"paymentType" in
																	localValue &&
																type.value
																	.paymentType ===
																	localValue.paymentType))
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

export default PaymentTypeSelectorNF;
