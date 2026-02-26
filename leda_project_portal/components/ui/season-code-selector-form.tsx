/**
 * SeasonCodeSelector (form) component
 *
 * React Hook Form-bound searchable combobox for selecting a season code.
 * Fetches season codes from both the roster and season-code APIs.  Supports
 * an `exclusive` mode that limits choices to non-current seasons, and an
 * `excludeCode` prop to omit a specific season from the list (useful in
 * edit forms to exclude the current value).
 */
// Import necessary modules and components
"use client";
import React, { useState } from "react";
import { Control, useFormContext, FormProvider } from "react-hook-form";
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
import { rosterRoute, seasonCodeRoute } from "@/lib/apiRoutes";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

// Update the interface to be more generic
interface FormValues {
	[key: string]: string; // This allows for dynamic field names
}

// Define the parameters for the SeasonCodeSelector component
interface SeasonCodeSelectorPropsContent {
	disabled?: boolean;
	name: string; // Add name prop to specify which field to watch/set
	exclusive?: boolean;
	excludeCode?: string; // Optional single season code to exclude
}

// Define the parameters for the SeasonCodeSelector component
interface SeasonCodeSelectorProps {
	disabled?: boolean;
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>;
	label: string;
	excludeCode?: string; // Optional single season code to exclude
	exclusive?: boolean;
}

// SeasonCodeSelector component definition
export default function SeasonCodeSelector({
	control,
	name,
	disabled,
	label,
	excludeCode,
	exclusive,
}: SeasonCodeSelectorProps) {
	return (
		// Render the form field with the provided props
		<FormProvider {...useFormContext()}>
			<FormField
				control={control}
				name={name}
				render={() => (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<SeasonCodeSelectorContent
								disabled={disabled}
								name={name}
								excludeCode={excludeCode}
								exclusive={exclusive}
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

// SeasonCodeSelectorContent component definition
const SeasonCodeSelectorContent: React.FC<SeasonCodeSelectorPropsContent> = ({
	disabled,
	name,
	excludeCode,
	exclusive,
}) => {
	const { watch, setValue } = useFormContext<FormValues>();
	const seasonCode = watch(name);
	const [open, setOpen] = useState(false);

	const justClosedRef = React.useRef(false);
	const popoverTriggerRef = React.useRef<HTMLButtonElement>(null);
	const lastInputType = useLastInputType();

	const { data: seasonCodes = [], isLoading: loading } = useQuery({
		queryKey: ["seasonCodes", excludeCode, exclusive],
		queryFn: async () => {
			const response = await fetch(seasonCodeRoute);
			const data = await response.json();
			let codes = data.map(
				(type: { seasonCode: string; desc: string }) => ({
					value: type.seasonCode,
					label: type.seasonCode + " - " + type.desc,
				})
			);

			let filterList: string[] = [];
			if (exclusive) {
				const response = await fetch(rosterRoute + "/rostersWithData");
				const rosterData = await response.json();
				filterList = rosterData.map(
					(item: { seasonCode: string }) => item.seasonCode
				);
			}

			if (filterList.length > 0) {
				codes = codes.filter(
					(code: { value: string; label: string }) =>
						filterList.includes(code.value)
				);
			}

			if (excludeCode) {
				codes = codes.filter(
					(code: { value: string; label: string }) =>
						code.value !== excludeCode
				);
			}

			return codes;
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
		setValue(name, type.value);
		setOpen(false);
		justClosedRef.current = true;
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="w-auto">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild disabled={loading}>
						<Button
							ref={popoverTriggerRef}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="w-[200px] justify-between"
							disabled={disabled}
							onFocus={handleFocus}
						>
							{seasonCode
								? seasonCodes.find(
										(type: { value: string; label: string }) => type.value === seasonCode
								  )?.label
								: "Select a season code..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[200px] p-0 bg-background"
					>
						<Command>
							<CommandInput placeholder="Search season code..." />
							<CommandEmpty>No season code found.</CommandEmpty>
							<CommandGroup>
								<CommandList
									className="max-h-60 overflow-y-auto"
									tabIndex={0}
									onWheel={e => e.stopPropagation()}
								>
									{seasonCodes.map((type: { value: string; label: string }) => (
										<CommandItem
											key={type.value}
											value={type.value}
											onSelect={() => handleSelect(type)}
											className="hover:bg-secondary"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													type.value === seasonCode
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