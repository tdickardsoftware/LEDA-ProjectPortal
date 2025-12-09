"use client";

import { useState, useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { rosterRoute } from "@/lib/apiRoutes";
import { RosterDivision } from "@/lib/definitions";
import { useQuery } from "@tanstack/react-query";

interface ReportDivisionSelectorProps {
    seasonCode: string;
    onDivisionsChange: (selectedDivisions: string) => void;
    disabled?: boolean;
}

export default function ReportDivisionSelector({
    seasonCode,
    onDivisionsChange,
    disabled = false,
}: ReportDivisionSelectorProps) {
    const [open, setOpen] = useState(false);
    const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);

    const { data: divisions = [], isLoading: loading } = useQuery({
        queryKey: ["reportDivisions", seasonCode],
        queryFn: async () => {
            if (!seasonCode) return [];
            const response = await fetch(
                `${rosterRoute}/rosterDivision?seasonCode=${seasonCode}`
            );
            if (!response.ok) throw new Error("Failed to fetch divisions");
            const data = await response.json();
            return data || [];
        },
        enabled: !!seasonCode,
    });

    useEffect(() => {
        // Update parent component with comma-separated string of selected divisions
        const divisionsString = selectedDivisions
            .map(divCode => {
                const division = divisions.find((d: RosterDivision) => d.division === divCode);
                return division?.division || divCode;
            })
            .join(", ");
        
        onDivisionsChange(divisionsString);
    }, [selectedDivisions, divisions, onDivisionsChange]);

    const toggleDivision = (divisionCode: string, e?: React.MouseEvent) => {
        // Stop propagation to prevent CommandItem's onSelect from firing when clicking checkbox
        if (e) {
            e.stopPropagation();
        }
        
        setSelectedDivisions(prev => {
            if (prev.includes(divisionCode)) {
                return prev.filter(d => d !== divisionCode);
            } else {
                return [...prev, divisionCode];
            }
        });
    };

    const selectedDivisionsText = selectedDivisions.length > 0
        ? selectedDivisions
            .map(divCode => {
                const division = divisions.find((d: RosterDivision) => d.division === divCode);
                return division?.division || divCode;
            })
            .join(", ")
        : "Select divisions...";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between bg-background border-border"
                    disabled={disabled}
                >
                    <span className="truncate">{selectedDivisionsText}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 bg-background">
                <Command>
                    <CommandInput placeholder="Search division..." />
                    <CommandEmpty>
                        {loading ? "Loading divisions..." : "No division found."}
                    </CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {divisions.map((division: RosterDivision) => (
                                <CommandItem
                                    key={division.division}
                                    value={division.division}
                                    onSelect={(currentValue) => {
                                        toggleDivision(currentValue);
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                                        <Checkbox
                                            checked={selectedDivisions.includes(division.division)}
                                            className="mr-2"
                                            onCheckedChange={() => toggleDivision(division.division)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <span>{division.division}</span>
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
