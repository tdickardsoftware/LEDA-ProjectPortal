"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
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

// Define the form values interface
interface FormValues {
	mentionBasis: string;
}

// List of gender options
const mentionBasisList = [
	{ value: "NONE", label: "NONE" },
	{ value: "LOW", label: "LOW" },
	{ value: "HIGH", label: "HIGH" },
];

const MentionBasisSelector: React.FC = () => {
	// Use form context to get control, watch, setValue, and register functions
	const { watch, setValue } = useFormContext<FormValues>();
	// Watch the gender field value
	const mentionBasis = watch("mentionBasis");
	// State to manage the popover open/close status
	const [open, setOpen] = React.useState(false);

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
							{mentionBasis
								? mentionBasisList.find(
										(g) => g.value === mentionBasis
								  )?.label
								: "Select a mention basis..."}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0 bg-white">
						<Command>
							<CommandInput placeholder="Search gender..." />
							<CommandEmpty>No mention basis found.</CommandEmpty>
							<CommandGroup>
								<CommandList>
									{mentionBasisList.map((g) => (
										<CommandItem
											key={g.value}
											value={g.value}
											onSelect={() => {
												setValue(
													"mentionBasis",
													g.value
												);
												setOpen(false);
											}}
											className="hover:bg-gray-200"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													g.value === mentionBasis
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											{g.label}
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

export default MentionBasisSelector;
