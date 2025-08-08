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
import { mentionRoute } from "@/lib/apiRoutes";
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
	mentionData: JSON;
}

interface MentionSelectorProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>; // Form control from React Hook Form
	name: string; // Field name in the form
	label: string; // Label text for the field
	disabled?: boolean; // Optional disabled state
	handleMentionChange?: (value: {
		mentionCode: string;
		desc: string;
		points: string;
		mentionBasis: string;
	}) => void; // Optional change handler
}

interface MentionSelectorContentProps {
	value?: JSON; // Current value (for uncontrolled mode)
	onChange?: (value: JSON) => void; // Change handler (for uncontrolled mode)
	disabled?: boolean; // Optional disabled state
	handleMentionChange?: (value: {
		mentionCode: string;
		desc: string;
		points: string;
		mentionBasis: string;
	}) => void; // Optional change handler
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
export default function MentionSelector({
	control,
	name,
	label,
	disabled,
	handleMentionChange,
}: MentionSelectorProps) {
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
								handleMentionChange={handleMentionChange} // Pass the change handler to the content component
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
const PenaltySelectorContent: React.FC<MentionSelectorContentProps> = ({
	value: propValue,
	onChange,
	disabled,
	handleMentionChange,
}) => {
	const formContext = useFormContext<FormValues>();
	const [localValue, setLocalValue] = useState(propValue || "");
	const [open, setOpen] = useState(false);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	const { data: memberTypes = [] } = useQuery({
		queryKey: ["mentions"],
		queryFn: async () => {
			const response = await fetch(mentionRoute);
			const data = await response.json();
			return data.map(
				(item: {
					mentionCode: string;
					desc: string;
					points: string;
					mentionBasis: string;
				}) => ({
					value: item,
					label:
						item.mentionCode +
						" - " +
						item.desc +
						" - " +
						item.points +
						"pts",
				})
			);
		},
	});

	const currentValue = formContext
		? formContext.watch("mentionData")
		: localValue;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleValueChange = (newValue: any) => {
		if (formContext) {
			formContext.setValue("mentionData", newValue);
		} else {
			setLocalValue(newValue);
			onChange?.(newValue);
		}
	};

	const getSelectedMention = () => {
		// If currentValue exists, try to find an exact match first
		if (currentValue) {
			// Try exact match
			const exactMatch = memberTypes.find(
				(type: { value: { mentionCode: string; desc: string; points: string; mentionBasis: string }; label: string }) =>
					JSON.stringify(type.value) === JSON.stringify(currentValue)
			);
			if (exactMatch) return exactMatch.label;

			// If no exact match, try to match by mentionCode
			if (
				currentValue &&
				typeof currentValue === "object" &&
				"mentionCode" in currentValue
			) {
				const codeMatch = memberTypes.find(
					(type: {
						value: { mentionCode: string; desc: string; points: string; mentionBasis: string };
						label: string;
					}) =>
						type.value.mentionCode === currentValue.mentionCode
				);
				if (codeMatch) return codeMatch.label;
			}
		}
		return "Select a mention...";
	};

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (type: {
		value: {
			mentionCode: string;
			desc: string;
			points: string;
			mentionBasis: string;
		};
		label: string;
	}) => {
		handleValueChange(type.value);
		handleMentionChange?.(type.value);
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
							{getSelectedMention()}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-fit p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search mention..." />
							<CommandEmpty>No mention found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
									{memberTypes.map(
										(
											type: {
												value: {
													mentionCode: string;
													desc: string;
													points: string;
													mentionBasis: string;
												};
												label: string;
											}
										) => (
											<CommandItem
												key={type.label}
												value={type.label}
												onSelect={() => handleSelect(type)}
												className="hover:bg-gray-200"
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
																	"mentionCode" in
																		currentValue &&
																	type.value
																		.mentionCode ===
																		currentValue.mentionCode))
															? "opacity-100"
															: "opacity-0"
													)}
												/>
												{type.label}
											</CommandItem>
										)
									)}
								</CommandList>
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};
