import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { MailingList } from "@/lib/definitions";
import { fetchWithSession } from "@/lib/getData";
import Fuse from "fuse.js";

interface Item {
	ledaId: string;
	name: string;
	addressLineOne?: string;
	addressLineTwo?: string;
	type?: string;
}

export function PopoverMultiSelect({
	apiRoute,
	label,
	selected,
	setSelected,
	type,
}: {
	apiRoute: string;
	label: string;
	selected: MailingList[];
	setSelected: (items: MailingList[]) => void;
	type: string;
}) {
	const { data = [], isLoading } = useQuery({
		queryKey: ['popoverMultiSelect', apiRoute],
		queryFn: async () => {
			// Check if the apiRoute has query parameters
			const url = new URL(apiRoute, 'http://localhost');
			const hasQueryParams = url.search.length > 0;
			
			let res;
			if (hasQueryParams) {
				// Check if this is the availableOnly parameter (should use GET)
				const availableOnlyParam = url.searchParams.get('availableOnly');
				const alreadySelectedParam = url.searchParams.get('alreadySelected');
				
				if (availableOnlyParam) {
					// Use regular GET request for availableOnly parameter
					res = await fetchWithSession(apiRoute);
				} else if (alreadySelectedParam) {
					// Extract alreadySelected from query params and send as POST
					const alreadySelected = alreadySelectedParam.split(',');
					
					// Use base URL without query params for POST
					const baseUrl = url.pathname;
					
					res = await fetchWithSession(baseUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ alreadySelected })
					});
				} else {
					// Default GET for other query parameters
					res = await fetchWithSession(apiRoute);
				}
			} else {
				// Use regular GET request
				res = await fetchWithSession(apiRoute);
			}
			
			if (!res.ok) {
				throw new Error(`Failed to fetch: ${res.status}`);
			}
			const data = await res.json();
			return data;
		},
		staleTime: 60 * 1000,
		enabled: !!apiRoute, // Only run when apiRoute is provided
	});



	const [popoverOpen, setPopoverOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Reset search when popover closes
	const handlePopoverOpenChange = useCallback((open: boolean) => {
		setPopoverOpen(open);
		if (!open) {
			setSearchQuery("");
		}
	}, []);

	const selectedIds = selected.map((item) => item.ledaId);

	// Configure Fuse.js for search
	const fuseOptions = useMemo(() => ({
		keys: ['ledaId', 'name', 'addressLineOne', 'addressLineTwo'],
		threshold: 0.3, // Lower = more strict matching
		includeScore: true,
		includeMatches: true,
		ignoreLocation: true,
		minMatchCharLength: 1,
	}), []);

	// Initialize Fuse instance
	const fuse = useMemo(() => {
		return new Fuse(data, fuseOptions);
	}, [data, fuseOptions]);

	// Parse field-specific search queries with AND/OR logic
	const parseFieldSearch = useCallback((query: string) => {
		// Check for field-specific patterns first
		const hasFieldPattern = /["']?(\w+|\w+\s+\w+)["']?\s*=/.test(query);
		
		if (!hasFieldPattern) {
			return { type: "general", query: query.trim() };
		}

		// Split by OR first (case insensitive)
		const orGroups = query.split(/\s+or\s+/gi);
		
		const searchGroups = orGroups.map(orGroup => {
			// Within each OR group, split by AND
			const andParts = orGroup.split(/\s+and\s+/gi);
			
			const fieldSearches: Array<{ field: string; values: string[] }> = [];
			let remainingQuery = "";
			
			andParts.forEach(part => {
				// Enhanced regex to handle quoted field names
				const quotedFieldMatch = part.match(/"([^"]+)"\s*=\s*(.+)/);
				const unquotedFieldMatch = part.match(/(\w+)\s*=\s*(.+)/);
				
				const fieldMatch = quotedFieldMatch || unquotedFieldMatch;
				
				if (fieldMatch) {
					const originalField = fieldMatch[1];
					// Map common field names
					const fieldMapping: Record<string, string> = {
						'id': 'ledaId',
						'leda id': 'ledaId',
						'ledaid': 'ledaId',
						'name': 'name',
						'address': 'addressLineOne',
						'address1': 'addressLineOne',
						'address 1': 'addressLineOne',
						'address2': 'addressLineTwo',
						'address 2': 'addressLineTwo',
						'type': 'type'
					};
					const resolvedField = fieldMapping[originalField.toLowerCase()] || originalField;
					const valuesPart = fieldMatch[2];
					
					// Parse comma-separated values
					const values: string[] = [];
					const quotedValuePattern = /"([^"]*)"/g;
					const quotedMatches = [...valuesPart.matchAll(quotedValuePattern)];
					
					if (quotedMatches.length > 0) {
						quotedMatches.forEach(match => {
							const quotedValue = match[1];
							if (quotedValue.includes(',')) {
								quotedValue.split(',').forEach(v => {
									const trimmed = v.trim();
									if (trimmed) values.push(trimmed);
								});
							} else {
								values.push(quotedValue);
							}
						});
					} else {
						valuesPart.split(',').forEach(v => {
							const trimmed = v.trim();
							if (trimmed) values.push(trimmed);
						});
					}
					
					if (values.length > 0) {
						fieldSearches.push({ field: resolvedField, values });
					}
				} else {
					if (part.trim()) {
						remainingQuery += " " + part.trim();
					}
				}
			});
			
			return {
				fieldSearches,
				remainingQuery: remainingQuery.trim(),
				operator: "AND" as const
			};
		});

		return {
			type: "field-specific" as const,
			searchGroups,
			operator: "OR" as const
		};
	}, []);

	// Enhanced filtered data with search functionality
	const filteredData = useMemo(() => {
		if (!searchQuery) return data;

		const searchConfig = parseFieldSearch(searchQuery);

		if (searchConfig.type === "general") {
			// Use Fuse.js for general search
			const results = fuse.search(searchConfig.query);
			return results.map(result => result.item);
		} else {
			// Handle field-specific searches with AND/OR logic
			return data.filter((row: Item) => {
				if (!searchConfig.searchGroups) return false;
				return searchConfig.searchGroups.some(group => {
					let fieldMatches = true;
					let generalMatches = true;
					
					// Check field-specific searches (all must match - AND logic)
					if (group.fieldSearches.length > 0) {
						fieldMatches = group.fieldSearches.every(({ field, values }) => {
							const cellValue = String(row[field as keyof Item] || "").toLowerCase();
							
							// If multiple values (comma-separated), treat as IN statement
							if (values.length > 1) {
								return values.some(value => 
									cellValue === value.toLowerCase()
								);
							} else {
								return cellValue.includes(values[0].toLowerCase());
							}
						});
					}
					
					// Check remaining general search text
					if (group.remainingQuery) {
						const tempFuse = new Fuse([row], fuseOptions);
						const results = tempFuse.search(group.remainingQuery);
						generalMatches = results.length > 0;
					}
					
					return fieldMatches && generalMatches;
				});
			});
		}
	}, [searchQuery, data, fuse, parseFieldSearch, fuseOptions]);

	const handleToggle = (id: string) => {
		const item = data.find((i: Item) => i.ledaId === id);
		if (!item) return;
		const exists = selectedIds.includes(id);
		let newSelected: MailingList[];
		if (exists) {
			newSelected = selected.filter((i) => i.ledaId !== id);
		} else {
			newSelected = [
				...selected,
				{
					ledaId: item.ledaId,
					name: item.name,
					addressLineOne: item.addressLineOne ?? "",
					addressLineTwo: item.addressLineTwo ?? "",
					type,
				},
			];
		}
		setSelected(newSelected);
		// Close popover if all selectable rows are selected
		if (filteredData.length > 0 && newSelected.length === data.length) {
			setPopoverOpen(false);
		}
	};

	return (
		<div className="flex flex-col w-full">
			<div className="font-semibold mb-2">{label}</div>
			<Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
				<PopoverTrigger asChild className="bg-background border-border">
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={popoverOpen}
						className="w-full justify-between"
					>
						{selected.length > 0
							? `${selected.length} selected`
							: `Select ${label}...`}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-80 p-0 bg-background border-border"
					onWheel={(e) => e.stopPropagation()}
				>
					<Command shouldFilter={false}>
						<CommandInput 
							placeholder={`Search ${label.toLowerCase()}... (try name=John or id=123)`}
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
						<CommandEmpty>
							{isLoading ? "Loading..." : `No ${label.toLowerCase()} found.`}
						</CommandEmpty>
						<CommandGroup>
							<CommandList className="max-h-64">
								{!isLoading && filteredData.length > 0 && filteredData.map((item: Item) => (
									<CommandItem
										key={item.ledaId}
										value={`${item.name} ${item.ledaId}`}
										onSelect={() => handleToggle(item.ledaId)}
										className="hover:bg-secondary"
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												selectedIds.includes(item.ledaId)
													? "opacity-100"
													: "opacity-0"
											)}
										/>
										<div className="flex flex-col">
											<span className="font-medium">{item.name}</span>
											<span className="text-xs text-muted-foreground">ID: {item.ledaId}</span>
										</div>
									</CommandItem>
								))}
							</CommandList>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
			<div className="mt-2">
				{selected.length === 0 ? (
					<div className="text-xs text-foreground">Selected: None</div>
				) : (
					<Table className="border rounded-lg bg-background shadow-sm text-xs mt-2">
						<TableHeader>
							<TableRow className="border-b border-border bg-muted/50">
								<TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">LEDA ID</TableHead>
								<TableHead className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{selected.map((item) => (
								<TableRow key={item.ledaId} className="border-b border-border hover:bg-muted/50 transition-colors">
									<TableCell className="px-6 py-4 text-sm text-foreground">{item.ledaId}</TableCell>
									<TableCell className="px-6 py-4 text-sm text-foreground">{item.name}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
}
