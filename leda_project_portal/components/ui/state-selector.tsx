// Import necessary modules and components
"use client";
import * as React from "react";
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
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

// List of U.S. States
const states = [
	{ value: "AL", label: "Alabama" },
	{ value: "AK", label: "Alaska" },
	{ value: "AZ", label: "Arizona" },
	{ value: "AR", label: "Arkansas" },
	{ value: "CA", label: "California" },
	{ value: "CO", label: "Colorado" },
	{ value: "CT", label: "Connecticut" },
	{ value: "DE", label: "Delaware" },
	{ value: "FL", label: "Florida" },
	{ value: "GA", label: "Georgia" },
	{ value: "HI", label: "Hawaii" },
	{ value: "ID", label: "Idaho" },
	{ value: "IL", label: "Illinois" },
	{ value: "IN", label: "Indiana" },
	{ value: "IA", label: "Iowa" },
	{ value: "KS", label: "Kansas" },
	{ value: "KY", label: "Kentucky" },
	{ value: "LA", label: "Louisiana" },
	{ value: "ME", label: "Maine" },
	{ value: "MD", label: "Maryland" },
	{ value: "MA", label: "Massachusetts" },
	{ value: "MI", label: "Michigan" },
	{ value: "MN", label: "Minnesota" },
	{ value: "MS", label: "Mississippi" },
	{ value: "MO", label: "Missouri" },
	{ value: "MT", label: "Montana" },
	{ value: "NE", label: "Nebraska" },
	{ value: "NV", label: "Nevada" },
	{ value: "NH", label: "New Hampshire" },
	{ value: "NJ", label: "New Jersey" },
	{ value: "NM", label: "New Mexico" },
	{ value: "NY", label: "New York" },
	{ value: "NC", label: "North Carolina" },
	{ value: "ND", label: "North Dakota" },
	{ value: "OH", label: "Ohio" },
	{ value: "OK", label: "Oklahoma" },
	{ value: "OR", label: "Oregon" },
	{ value: "PA", label: "Pennsylvania" },
	{ value: "RI", label: "Rhode Island" },
	{ value: "SC", label: "South Carolina" },
	{ value: "SD", label: "South Dakota" },
	{ value: "TN", label: "Tennessee" },
	{ value: "TX", label: "Texas" },
	{ value: "UT", label: "Utah" },
	{ value: "VT", label: "Vermont" },
	{ value: "VA", label: "Virginia" },
	{ value: "WA", label: "Washington" },
	{ value: "WV", label: "West Virginia" },
	{ value: "WI", label: "Wisconsin" },
	{ value: "WY", label: "Wyoming" },
];

// Define the parameters for the StatePicker component
interface StatePickerProps {
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
}

// Define the parameters for the StatePickerContent component
interface StatePickerContentProps {
	field: {
		value: string;
		onChange: (value: string) => void;
	};
}

// StatePicker component definition
export default function StatePicker({ name, control }: StatePickerProps) {
	return (
		// Render the form field with the provided props
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<FormLabel>State *</FormLabel>
						<FormControl>
							<StatePickerContent field={field} />
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

// StatePickerContent component definition
const StatePickerContent: React.FC<StatePickerContentProps> = ({ field }) => {
	const [open, setOpen] = React.useState(false);
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
			// Filter out elements not actually focusable/visible
			if (el.hasAttribute("disabled")) return false;
			if (el.getAttribute("aria-disabled") === "true") return false;
			if (el.tabIndex < 0) return false;
			// offsetParent is null for display:none; allow fixed-position elements (offsetParent null)
			if ((el as HTMLElement).offsetParent === null) {
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

	const handleFocus = React.useCallback(() => {
		if (lastInputType === "keyboard" && !open && !justClosedRef.current) {
			setOpen(true);
		}
		if (justClosedRef.current) {
			justClosedRef.current = false;
		}
	}, [lastInputType, open]);

	const handleSelect = (value: string) => {
		field.onChange(value);
		setOpen(false);
		justClosedRef.current = true;
	};

	return (
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
						{field.value
							? states.find(
									(state) => state.value === field.value
							  )?.label
							: "Select a state..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-[200px] p-0 bg-background"
					tabIndex={0}
					onKeyDownCapture={(e) => {
						// If the user tabs away, close the menu and allow focus to move on.
						if (e.key === "Tab") {
							closeFromTabRef.current = true;
							e.preventDefault();
							setOpen(false);
							justClosedRef.current = true;
							// Because the popover content is rendered in a portal, native tab order
							// won't naturally continue within the form. Manually move focus.
							const direction = e.shiftKey ? "prev" : "next";
							requestAnimationFrame(() => focusAdjacentField(direction));
						}
					}}
					onFocusOutside={() => {
						// Close when focus leaves the popover (e.g., keyboard tabbing).
						setOpen(false);
						justClosedRef.current = true;
					}}
					onCloseAutoFocus={(e) => {
						// When closing via Tab, don't restore focus to the trigger (so Tab continues naturally).
						if (closeFromTabRef.current) {
							e.preventDefault();
							closeFromTabRef.current = false;
						}
					}}
				>
					<Command>
						<CommandInput placeholder="Search state..." autoFocus />
						<CommandEmpty>No state found.</CommandEmpty>
						<CommandGroup>
							<CommandList
								className="max-h-60 overflow-y-auto"
								tabIndex={0}
								onWheel={(e) => e.stopPropagation()}
							>
								{states.map((state) => (
									<CommandItem
										key={state.value}
										value={state.value}
										onSelect={() => handleSelect(state.value)}
										className="hover:bg-secondary"
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												state.value === field.value
													? "opacity-100"
													: "opacity-0"
											)}
										/>
										{state.label}
									</CommandItem>
								))}
							</CommandList>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};