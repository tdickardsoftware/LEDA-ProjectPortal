/**
 * PlaceTypeSelector component
 *
 * Searchable combobox for selecting a place type within a React Hook Form
 * context.  Tracks the last input type (keyboard vs mouse) to apply correct
 * focus styling.  Fetches place types from the API via TanStack Query and
 * writes the selected value into the bound form field.
 */
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
import { placeTypeRoute } from "@/lib/apiRoutes";
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

	const justClosedRef = React.useRef(false);
	const closeFromTabRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	const focusAdjacentField = React.useCallback((direction: "next" | "prev") => {
		const trigger = popoverTriggerRef.current;
		if (!trigger) return;

		const root = trigger.closest("form") ?? trigger.closest("[role='dialog']") ?? document;
		const focusableSelector =
			"a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

		const focusables = Array.from(
			root.querySelectorAll<HTMLElement>(focusableSelector)
		).filter((el) => {
			if (el.hasAttribute("disabled")) return false;
			if (el.getAttribute("aria-disabled") === "true") return false;
			if (el.tabIndex < 0) return false;
			if (el.offsetParent === null) {
				const style = window.getComputedStyle(el);
				if (style.position !== "fixed") return false;
			}
			return true;
		});

		const index = focusables.indexOf(trigger);
		if (index === -1) return;
		const nextIndex = direction === "next" ? index + 1 : index - 1;
		const nextEl = focusables[nextIndex];
		if (nextEl) nextEl.focus();
	}, []);

	const { data: memberTypes = [] } = useQuery({
		queryKey: ["placeTypes"],
		queryFn: async () => {
			const response = await fetch(placeTypeRoute);
			const data = await response.json();
			return data.map(
				(type: { placeTypeCode: string; desc: string }) => ({
					value: type.placeTypeCode,
					label: type.placeTypeCode + " - " + type.desc,
				})
			);
		},
	});

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

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (value: string) => {
		handleValueChange(value);
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
								? memberTypes.find(
										(type: { value: string; label: string }) => type.value === currentValue
								  )?.label
								: "Select a place type..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-background"
						onKeyDownCapture={(e) => {
							if (e.key === "Tab") {
								closeFromTabRef.current = true;
								e.preventDefault();
								setOpen(false);
								justClosedRef.current = true;
								const direction = e.shiftKey ? "prev" : "next";
								requestAnimationFrame(() => focusAdjacentField(direction));
							}
						}}
						onFocusOutside={() => {
							setOpen(false);
							justClosedRef.current = true;
						}}
						onCloseAutoFocus={(e) => {
							if (closeFromTabRef.current) {
								e.preventDefault();
								closeFromTabRef.current = false;
							}
						}}
					>
						<Command>
							<CommandInput placeholder="Search place type..." />
							<CommandEmpty>No place type found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
									{memberTypes.map((type: { value: string; label: string }) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => handleSelect(type.value)}
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