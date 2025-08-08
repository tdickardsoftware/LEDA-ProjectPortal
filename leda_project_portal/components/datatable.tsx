/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Fuse from "fuse.js";
import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
	getSortedRowModel,
	CellContext,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import RosterSeasonCodeSelector from "@/components/ui/roster-season-code-selector";
import { Checkbox } from "@/components/ui/checkbox";
import {
	placePaymentHistoryRoute,
	rosterRoute,
	teamPaymentHistoryRoute,
} from "@/lib/apiRoutes";
// Import the required icons and paymentRoute
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { playerPaymentHistoryRoute } from "@/lib/apiRoutes";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";

// Add interface for payment status data
interface PaymentStatus {
	ledaId: string | number;
	status: "PAID" | "PART" | "UNPAID";
}

interface DataTableProps<TData extends Record<string, unknown>, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pageName: string;
	addDialog?: React.ReactNode;
	deleteDialog?: React.ReactNode;
	editDialog?: React.ReactNode;
	viewLink?: React.ReactNode;
	onRefresh?: (api: string) => void;
	apiEndpoint: string; // New prop for API endpoint
	defaultSort?: string;
	singleRowSelection?: boolean;
	passValueToParent?: (value: string) => void;
	defaultSelectedRow?: number; // Optional prop for default selected row
	filter?: boolean; // New optional prop
}

export function DataTable<TData extends Record<string, unknown>, TValue>({
	columns,
	data,
	pageName,
	addDialog,
	deleteDialog,
	editDialog,
	viewLink,
	onRefresh,
	apiEndpoint, // Destructure the new prop
	defaultSort,
	singleRowSelection,
	passValueToParent,
	defaultSelectedRow,
	filter,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = React.useState(""); // State for search input
	const [activeSearchQuery, setActiveSearchQuery] = React.useState(""); // State for executed search
	const [tableData, setTableData] = React.useState(data); // State for table data
	const [rowSelection, setRowSelection] = React.useState({}); // State for row selection
	const [selectedRowCount, setSelectedRowCount] = React.useState(0); // New state for selected row count
	// Initialize pageIndex from localStorage immediately
	const [pageIndex, setPageIndex] = React.useState<number>(() => {
		if (typeof window !== 'undefined') {
			const savedPageIndex = localStorage.getItem(`datatable_pageIndex_${pageName}`);
			if (savedPageIndex !== null) {
				const parsedIndex = parseInt(savedPageIndex, 10);
				if (!isNaN(parsedIndex) && parsedIndex >= 0) {
					return parsedIndex;
				}
			}
		}
		return 0;
	});
	// Define a unique storage key for page index based on pageName
	const pageIndexStorageKey = `datatable_pageIndex_${pageName}`;

	// Filter state
	const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false);
	const [filterSeasonCode, setFilterSeasonCode] = React.useState<string>("");
	const [filterCurrentSeason, setFilterCurrentSeason] =
		React.useState<boolean>(true);
	const [filteredLedaIds, setFilteredLedaIds] = React.useState<
		string[] | null
	>(null);
	const [filterLoading, setFilterLoading] = React.useState(false);

	// Add new state for payment status
	const [showPaymentStatus, setShowPaymentStatus] =
		React.useState<boolean>(false);

	// Add local state for the Show Payment Status checkbox
	const [pendingShowPaymentStatus, setPendingShowPaymentStatus] =
		React.useState<boolean>(false);

	// --- TanStack Query: Fetch payment status data ---
	const {
		data: paymentStatusData = [],
		isFetching: paymentStatusLoading,
		refetch: refetchPaymentStatus,
	} = useQuery<PaymentStatus[]>({
		queryKey: [
			"datatablePaymentStatus",
			pageName,
			filterSeasonCode,
			showPaymentStatus,
		],
		enabled: !!showPaymentStatus && !!filterSeasonCode,
		queryFn: async () => {
			let res;
			if (pageName.includes("Players")) {
				res = await fetch(
					`${playerPaymentHistoryRoute}/viewData?seasonCode=${filterSeasonCode}`
				);
			} else if (pageName.includes("Places")) {
				res = await fetch(
					`${placePaymentHistoryRoute}/viewData?seasonCode=${filterSeasonCode}`
				);
			} else {
				res = await fetch(
					`${teamPaymentHistoryRoute}/viewData?seasonCode=${filterSeasonCode}`
				);
			}
			const data = await res.json();
			return Array.isArray(data) ? data : [];
		},
	});

	// Remove the old debounce effect and replace with manual search execution
	const executeSearch = React.useCallback(() => {
		setActiveSearchQuery(searchQuery);
	}, [searchQuery]);

	// Clear search function
	const clearSearch = React.useCallback(() => {
		setSearchQuery("");
		setActiveSearchQuery("");
	}, []);

	// Handle enter key in search input
	const handleSearchKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			executeSearch();
		} else if (e.key === 'Escape') {
			clearSearch();
		}
	}, [executeSearch, clearSearch]);

	// Configure Fuse.js for search
	const fuseOptions = React.useMemo(() => {
		const searchKeys = columns
			.map((col) => {
				if (col.id) return col.id;
				if ("accessorKey" in col && typeof col.accessorKey === "string") {
					return col.accessorKey;
				}
				return null;
			})
			.filter(Boolean) as string[];

		return {
			keys: searchKeys,
			threshold: 0.3, // Lower = more strict matching
			includeScore: true,
			includeMatches: true,
			ignoreLocation: true,
			minMatchCharLength: 1,
		};
	}, [columns]);

	// Initialize Fuse instance
	const fuse = React.useMemo(() => {
		let base = tableData;
		if (filteredLedaIds) {
			base = base.filter((row) =>
				filteredLedaIds.includes(String(row.ledaId))
			);
		}
		return new Fuse(base, fuseOptions);
	}, [tableData, filteredLedaIds, fuseOptions]);

	// Helper function to extract text from React elements (improved)
	const extractTextFromReactElement = React.useCallback((element: unknown): string => {
		if (typeof element === "string") return element;
		if (typeof element === "number") return String(element);

		// Handle React elements
		if (element && typeof element === "object") {
			const el = element as { props?: { [key: string]: unknown } };
			// If it has props.children, recurse into children
			if (el.props?.children) {
				if (typeof el.props.children === "string") {
					return el.props.children;
				}
				if (Array.isArray(el.props.children)) {
					return el.props.children
						.map((child) => extractTextFromReactElement(child))
						.filter((text) => text && text.trim())
						.join(" ");
				}
				// Single child that's not a string
				return extractTextFromReactElement(el.props.children);
			}

			// Check for common text properties
			if (el.props?.title && typeof el.props.title === "string") return el.props.title;
			if (el.props?.alt && typeof el.props.alt === "string") return el.props.alt;
			if (el.props?.label && typeof el.props.label === "string") return el.props.label;
		}

		return "";
	}, []);

	// Create column mapping for field name translation
	const columnMapping = React.useMemo(() => {
		const mapping = new Map<string, string>();
		
		
		columns.forEach((col, index) => {
			let displayName = "";
			let dataKey = "";
			
			// Get display name from header - handle all possible header types
			if (typeof col.header === "string") {
				displayName = col.header;
			} else if (typeof col.header === "function") {
				// Try to render the header function to get the display name
				try {
					const mockContext = {
						header: {
							column: { columnDef: col },
							getContext: () => ({}),
						}
					} as any;
					const rendered = col.header(mockContext);
					if (typeof rendered === "string") {
						displayName = rendered;
					} else if (rendered && typeof rendered === "object" && "props" in rendered) {
						// Handle React elements - try to extract text content
						displayName = extractTextFromReactElement(rendered);
					}
				} catch (e) {
					console.warn(`Error rendering header function for column ${index}:`, e);
				}
			}
			
			// Get data key
			if (col.id) {
				dataKey = col.id;
			} else if ("accessorKey" in col && typeof col.accessorKey === "string") {
				dataKey = col.accessorKey;
			}
			
			if (dataKey) { // Only need dataKey to create mappings
				const variations = new Set<string>();
				
				// Add display name variations if available
				if (displayName && displayName.trim()) {
					const cleanDisplayName = displayName.trim();
					variations.add(cleanDisplayName.toLowerCase());
					variations.add(cleanDisplayName.toLowerCase().replace(/\s+/g, ""));
					variations.add(cleanDisplayName.toLowerCase().replace(/[^a-z0-9]/g, ""));
				}
				
				// Add data key variations
				variations.add(dataKey.toLowerCase());
				variations.add(dataKey); // original case
				
				// Add camelCase variations
				if (dataKey !== dataKey.toLowerCase()) {
					variations.add(dataKey.toLowerCase());
					const underscored = dataKey.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
					variations.add(underscored);
					const spaced = dataKey.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
					variations.add(spaced);
				}
				
				// Remove empty variations and add to mapping
				Array.from(variations).forEach(variation => {
					if (variation && variation.trim()) {
						mapping.set(variation, dataKey);
					}
				});
			}
		});
		
		return mapping;
	}, [columns, extractTextFromReactElement]);

	// Helper function to resolve field name to actual data key
	const resolveFieldName = React.useCallback((fieldName: string): string => {
		const normalized = fieldName.toLowerCase();
		
		// Try exact match first
		if (columnMapping.has(normalized)) {
			const resolved = columnMapping.get(normalized)!;
			return resolved;
		}
		
		// Try without spaces and special characters
		const cleanName = normalized.replace(/[^a-z0-9]/g, "");
		if (columnMapping.has(cleanName)) {
			const resolved = columnMapping.get(cleanName)!;
			return resolved;
		}
		
		// Return original if no mapping found
		return fieldName;
	}, [columnMapping]);

	// Parse field-specific search queries with AND/OR logic
	const parseFieldSearch = React.useCallback((query: string) => {
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
				// Enhanced regex to handle quoted field names: "LEDA ID Number"=value or field=value
				const quotedFieldMatch = part.match(/"([^"]+)"\s*=\s*(.+)/);
				const unquotedFieldMatch = part.match(/(\w+)\s*=\s*(.+)/);
				
				const fieldMatch = quotedFieldMatch || unquotedFieldMatch;
				
				if (fieldMatch) {
					const originalField = fieldMatch[1];
					const resolvedField = resolveFieldName(originalField);
					const valuesPart = fieldMatch[2];
					
					// Parse comma-separated values, handling both quoted and unquoted
					const values: string[] = [];
					const quotedValuePattern = /"([^"]*)"/g;
					const quotedMatches = [...valuesPart.matchAll(quotedValuePattern)];
					
					if (quotedMatches.length > 0) {
						// Has quoted values - check if they contain commas for splitting
						quotedMatches.forEach(match => {
							const quotedValue = match[1];
							if (quotedValue.includes(',')) {
								// Split comma-separated values inside quotes
								quotedValue.split(',').forEach(v => {
									const trimmed = v.trim();
									if (trimmed) values.push(trimmed);
								});
							} else {
								// Single value inside quotes
								values.push(quotedValue);
							}
						});
					} else {
						// No quotes, split by comma
						valuesPart.split(',').forEach(v => {
							const trimmed = v.trim();
							if (trimmed) values.push(trimmed);
						});
					}
					
					if (values.length > 0) {
						fieldSearches.push({ field: resolvedField, values });
					}
				} else {
					// This part is general search text
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
	}, [resolveFieldName]);

	// Enhanced filtered data with manual search execution
	const filteredData = React.useMemo(() => {
		let base = tableData;
		if (filteredLedaIds) {
			base = base.filter((row) =>
				filteredLedaIds.includes(String(row.ledaId))
			);
		}
		
		if (!activeSearchQuery) return base;

		const searchConfig = parseFieldSearch(activeSearchQuery);

		if (searchConfig.type === "general") {
			// Use Fuse.js for general search
			const results = fuse.search(searchConfig.query);
			return results.map(result => result.item);
		} else {
			// Handle field-specific searches with AND/OR logic
			return base.filter(row => {
				// OR logic: row matches if it satisfies ANY search group
				if (!searchConfig.searchGroups) return false;
				return searchConfig.searchGroups.some(group => {
					// AND logic within group: row must satisfy ALL conditions in the group
					let fieldMatches = true;
					let generalMatches = true;
					
					// Check field-specific searches (all must match - AND logic)
					if (group.fieldSearches.length > 0) {
						fieldMatches = group.fieldSearches.every(({ field, values }) => {
							const cellValue = String(row[field] || "").toLowerCase();
							
							// If multiple values (comma-separated), treat as IN statement
							if (values.length > 1) {
								// Exact match for any of the values (IN behavior)
								return values.some(value => 
									cellValue === value.toLowerCase()
								);
							} else {
								// Single value: use contains for partial matching
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
					
					// Both field and general searches must match within this group
					return fieldMatches && generalMatches;
				});
			});
		}
	}, [activeSearchQuery, tableData, filteredLedaIds, fuse, parseFieldSearch, fuseOptions]);

	// Function to get payment status for a given ledaId
	const getPaymentStatus = React.useCallback(
		(ledaId: string | number) => {
			const paymentRecord = paymentStatusData.find(
				(p) => String(p.ledaId) === String(ledaId)
			);
			return paymentRecord?.status || null;
		},
		[paymentStatusData]
	);

	// Helper to render payment status icon with tooltip
	const renderPaymentStatusIcon = React.useCallback(
		(ledaId: string | number) => {
			if (!showPaymentStatus || paymentStatusData.length === 0)
				return null;

			const status = getPaymentStatus(ledaId);
			if (!status) return null;

			let icon = null;
			let tooltipText = "";
			switch (status) {
				case "PAID":
					icon = (
						<CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
					);
					tooltipText = "Paid";
					break;
				case "PART":
					icon = (
						<AlertTriangle className="h-5 w-5 text-amber-500 ml-2" />
					);
					tooltipText = "Partial";
					break;
				case "UNPAID":
					icon = <XCircle className="h-5 w-5 text-red-500 ml-2" />;
					tooltipText = "Unpaid";
					break;
				default:
					return null;
			}
			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<span>{icon}</span>
						</TooltipTrigger>
						<TooltipContent className="bg-white rounded-lg">
							{tooltipText}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
		[showPaymentStatus, paymentStatusData, getPaymentStatus]
	);

	// Enhance columns with payment status if enabled
	const enhancedColumns = React.useMemo(() => {
		if (!showPaymentStatus || paymentStatusData.length === 0)
			return columns;

		return columns.map((col) => {
			// Find the column that likely contains the name (assuming it has 'name' in the id or accessorKey)
			const isNameColumn =
				col.id?.toLowerCase().includes("name") ||
				("accessorKey" in col &&
					typeof col.accessorKey === "string" &&
					col.accessorKey.toLowerCase().includes("name"));

			if (isNameColumn) {
				return {
					...col,
					cell: (info: CellContext<TData, TValue>) => {
						// Render the original cell content
						let originalContent: React.ReactNode;
						if (col.cell) {
							originalContent = flexRender(col.cell, info);
						} else if (
							"accessorKey" in col &&
							typeof col.accessorKey === "string"
						) {
							originalContent = String(
								info.row.original[col.accessorKey]
							);
						} else {
							originalContent = String(info.getValue());
						}
						const ledaId = info.row.original.ledaId;

						// Render both the original content and the icon
						return (
							<div className="flex items-center">
								{originalContent}
								{renderPaymentStatusIcon(Number(ledaId))}
							</div>
						);
					},
				};
			}
			return col;
		});
	}, [
		columns,
		showPaymentStatus,
		paymentStatusData,
		renderPaymentStatusIcon,
	]);

	const table = useReactTable({
		// Assign table instance to ref
		// Removed invalid onTableInstanceChange property
		data: filteredData, // Use filtered data here
		columns: enhancedColumns, // Use enhanced columns instead of original columns
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		enableMultiRowSelection: !singleRowSelection,
		state: {
			sorting,
			rowSelection,
			pagination: {
				pageIndex,
				pageSize: 10
			}, // Add pagination state
		},
		onPaginationChange: (updater) => {
			// updater can be a function or value
			if (typeof updater === "function") {
				setPageIndex((prev) => {
					const next = updater({
						pageIndex: prev,
						pageSize: 5
					}).pageIndex;
					// Save to localStorage immediately
					localStorage.setItem(pageIndexStorageKey, next.toString());
					return next;
				});
			} else if (typeof updater === "object" && updater !== null && "pageIndex" in updater) {
				const newIndex = updater.pageIndex;
				setPageIndex(newIndex);
				// Save to localStorage immediately
				localStorage.setItem(pageIndexStorageKey, newIndex.toString());
			}
		},
		initialState: {
			sorting: [{ id: defaultSort ? defaultSort : "", desc: false }],
			pagination: { pageIndex, pageSize: 5 }, // Use the initialized pageIndex
		},
	});

	// Extract selected rows' data
	const selectedRowsData = React.useMemo(() => {
		const selectedRowIds = Object.keys(rowSelection);
		// Get row data directly from the table's row model rather than using tableData indices
		return table
			.getRowModel()
			.rows.filter((row) => selectedRowIds.includes(row.id))
			.map((row) => row.original);
	}, [rowSelection, table]);

	// Update selectedRowCount whenever rowSelection changes
	React.useEffect(() => {
		setSelectedRowCount(Object.keys(rowSelection).length);
		if (passValueToParent) {
			passValueToParent(JSON.stringify(selectedRowsData)); // Send selected row data to parent
		}
	}, [rowSelection, passValueToParent, selectedRowsData]);
	// Refresh the table data
	const handleRefresh = async () => {
		try {
			const response = await fetch(apiEndpoint); // Use the dynamic API endpoint
			const newData = await response.json();
			setTableData(newData);
			setRowSelection({}); // Clear row selection on refresh
			// Don't reset page index on refresh - keep user's current position
		} catch (error) {
			console.error("Failed to refresh data", error);
		}
	};

	React.useEffect(() => {
		handleRefresh(); // Call handleRefresh without arguments
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onRefresh]);

	// Set default selected row if provided
	React.useEffect(() => {
		if (defaultSelectedRow !== undefined && defaultSelectedRow >= 0) {
			setRowSelection({ [defaultSelectedRow]: true });
		}
	}, [defaultSelectedRow]);

	// When filterCurrentSeason changes, reset filterSeasonCode and pendingShowPaymentStatus if needed
	React.useEffect(() => {
		if (filterCurrentSeason) {
			setFilterSeasonCode("");
			setPendingShowPaymentStatus(false);
			setShowPaymentStatus(false);
		}
	}, [filterCurrentSeason]);

	// Only fetch payment status when showPaymentStatus is set (after Apply)
	React.useEffect(() => {
		if (showPaymentStatus && filterSeasonCode) {
			refetchPaymentStatus();
		}
		// No else branch needed, paymentStatusData will be empty if not enabled
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showPaymentStatus, filterSeasonCode]);

	const handleApplyFilter = async () => {
		if (!filterSeasonCode) return;
		setFilterLoading(true);
		try {
			let res;
			if (pageName.includes("Players")) {
				res = await fetch(
					`${rosterRoute}/rosterPlayerView?seasonCode=${filterSeasonCode}`
				);
			} else if (pageName.includes("Places")) {
				res = await fetch(
					`${rosterRoute}/rosterPlaceView?seasonCode=${filterSeasonCode}`
				);
			} else {
				res = await fetch(
					`${rosterRoute}/rosterTeamView?seasonCode=${filterSeasonCode}`
				);
			}
			const ids: { ledaId: string | number }[] = await res.json();
			// Extract ledaId values from the array of objects
			const ledaIds = Array.isArray(ids)
				? ids.map((item) => String(item.ledaId))
				: [];
			setFilteredLedaIds(ledaIds);
			setShowPaymentStatus(pendingShowPaymentStatus); // Only set showPaymentStatus on Apply
			setFilterPopoverOpen(false);
		} catch (e) {
			console.error("Failed to filter by season", e);
		} finally {
			setFilterLoading(false);
		}
	};

	// Add state for context menu
	const [contextMenu, setContextMenu] = React.useState<{
		show: boolean;
		x: number;
		y: number;
		columnName: string;
	}>({ show: false, x: 0, y: 0, columnName: "" });

	// Add state for row context menu
	const [rowContextMenu, setRowContextMenu] = React.useState<{
		show: boolean;
		x: number;
		y: number;
		columnKey: string;
		columnName: string;
		cellValue: string;
	}>({ show: false, x: 0, y: 0, columnKey: "", columnName: "", cellValue: "" });

	// Ref for the search input to focus and position cursor
	const searchInputRef = React.useRef<HTMLInputElement>(null);

	// Handle right-click on column headers
	const handleColumnRightClick = React.useCallback((e: React.MouseEvent, columnName: string) => {
		e.preventDefault();
		setContextMenu({
			show: true,
			x: e.clientX,
			y: e.clientY,
			columnName
		});
	}, []);

	// Handle right-click on table cells
	const handleCellRightClick = React.useCallback((
		e: React.MouseEvent, 
		columnKey: string, 
		columnName: string, 
		cellValue: any
	) => {
		// Don't show context menu for select column
		if (columnKey === "select") return;
		
		e.preventDefault();
		setRowContextMenu({
			show: true,
			x: e.clientX,
			y: e.clientY,
			columnKey,
			columnName,
			cellValue: String(cellValue || "")
		});
	}, []);

	// Handle context menu option selection
	const handleAddToSearch = React.useCallback(() => {
		const { columnName } = contextMenu;
		const searchPattern = `"${columnName}"=""`;
		
		// If there's existing search text, add " and " before the new pattern
		const newSearchQuery = searchQuery 
			? `${searchQuery} and ${searchPattern}`
			: searchPattern;
		
		setSearchQuery(newSearchQuery);
		setContextMenu({ show: false, x: 0, y: 0, columnName: "" });
		
		// Focus the input and position cursor between the quotes
		setTimeout(() => {
			if (searchInputRef.current) {
				searchInputRef.current.focus();
				const cursorPosition = newSearchQuery.length - 1; // Position inside the closing quotes
				searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
			}
		}, 0);
	}, [contextMenu, searchQuery]);

	// Handle adding cell value to search
	const handleAddCellToSearch = React.useCallback(() => {
		const { columnName, cellValue } = rowContextMenu;
		
		// Check if this field is already in the search query
		const fieldPattern = new RegExp(`"${columnName}"\\s*=\\s*([^\\s]+(?:\\s+(?!and|or)[^\\s]*)*)`);
		const match = searchQuery.match(fieldPattern);
		
		if (match) {
			// Field exists, add to its values
			const existingValues = match[1];
			const newSearchQuery = searchQuery.replace(
				fieldPattern,
				`"${columnName}"="${existingValues.replace(/"/g, '')},${cellValue}"`
			);
			setSearchQuery(newSearchQuery);
		} else {
			// Field doesn't exist, add new field search
			const searchPattern = `"${columnName}"="${cellValue}"`;
			const newSearchQuery = searchQuery 
				? `${searchQuery} and ${searchPattern}`
				: searchPattern;
			setSearchQuery(newSearchQuery);
		}
		
		setRowContextMenu({ show: false, x: 0, y: 0, columnKey: "", columnName: "", cellValue: "" });
	}, [rowContextMenu, searchQuery]);

	// Close context menus when clicking elsewhere
	React.useEffect(() => {
		const handleClickOutside = () => {
			setContextMenu({ show: false, x: 0, y: 0, columnName: "" });
			setRowContextMenu({ show: false, x: 0, y: 0, columnKey: "", columnName: "", cellValue: "" });
		};

		if (contextMenu.show || rowContextMenu.show) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	}, [contextMenu.show, rowContextMenu.show]);

	// Helper function to extract display name from column header
	const getColumnDisplayName = React.useCallback((col: ColumnDef<TData, TValue>): string => {
		if (typeof col.header === "string") {
			return col.header;
		} else if (typeof col.header === "function") {
			try {
				const mockColumn = {
					columnDef: col,
					getIsSorted: () => false,
					toggleSorting: () => {},
					...col
				};
				const mockContext = {
					column: mockColumn,
					header: {
						column: mockColumn,
						getContext: () => mockContext
					},
					table: {
						getIsAllPageRowsSelected: () => false,
						getIsSomePageRowsSelected: () => false,
						toggleAllPageRowsSelected: () => {}
					}
				} as any;
				
				const rendered = col.header(mockContext);
				if (typeof rendered === "string") {
					return rendered;
				} else if (rendered) {
					return extractTextFromReactElement(rendered);
				}
			} catch {
				// Fallback to accessor key or id
				if ("accessorKey" in col && typeof col.accessorKey === "string") {
					return col.accessorKey;
				}
				if (col.id) {
					return col.id;
				}
			}
		}
		return "";
	}, [extractTextFromReactElement]);

	// Save page index to localStorage whenever it changes
	React.useEffect(() => {
		localStorage.setItem(pageIndexStorageKey, pageIndex.toString());
	}, [pageIndex, pageIndexStorageKey]);

	return (
		<div className="w-full">
			<div className="p-5 shadow-sm bg-white rounded-xl border border-gray-200 w-full transition-all">
				<div className="overflow-hidden rounded-lg">
					<h1 className="text-2xl font-medium pb-4 text-center text-gray-700">
						{pageName}
					</h1>
					<div className="flex items-center justify-between space-x-3 mb-4">
						{addDialog ? (
							<div>
								{React.cloneElement(
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									addDialog as React.ReactElement<any>,
									{ onRefresh: handleRefresh }
								)}
							</div>
						) : null}
						<div className="flex space-x-2">
							{/* Filter By Season Button and Popover */}
							{filter && (
								<Popover
									open={filterPopoverOpen}
									onOpenChange={setFilterPopoverOpen}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className="hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
											onClick={() =>
												setFilterPopoverOpen(true)
											}
										>
											Filter By Season
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[260px] bg-white shadow-md rounded-lg border border-gray-200 p-4">
										<div className="flex flex-col gap-3">
											<RosterSeasonCodeSelector
												disabled={filterCurrentSeason}
												handleSelect={
													setFilterSeasonCode
												}
												useCurrentSeason={
													filterCurrentSeason
												}
												seasonCode={filterSeasonCode}
											/>
											<div className="flex items-center gap-2">
												<Checkbox
													checked={
														filterCurrentSeason
													}
													onCheckedChange={() =>
														setFilterCurrentSeason(
															!filterCurrentSeason
														)
													}
												/>
												<span className="text-gray-700 text-sm">
													Current Season?
												</span>
											</div>
											{/* Show Payment Status checkbox only affects pendingShowPaymentStatus */}
											{filterSeasonCode && (
												<div className="flex items-center gap-2">
													<Checkbox
														checked={
															pendingShowPaymentStatus
														}
														onCheckedChange={() =>
															setPendingShowPaymentStatus(
																!pendingShowPaymentStatus
															)
														}
														disabled={
															paymentStatusLoading
														}
													/>
													<span className="text-gray-700 text-sm">
														Show Payment Status
													</span>
													{paymentStatusLoading && (
														<span className="text-xs ml-2 text-gray-500">
															(Loading...)
														</span>
													)}
												</div>
											)}
											<Button
												onClick={handleApplyFilter}
												disabled={
													!filterSeasonCode ||
													filterLoading
												}
												className="w-full hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
											>
												{filterLoading
													? "Applying..."
													: "Apply"}
											</Button>
											{filteredLedaIds && (
												<Button
													variant="ghost"
													onClick={() => {
														setFilteredLedaIds(
															null
														);
														setShowPaymentStatus(
															false
														);
														setPendingShowPaymentStatus(
															false
														);
													}}
													className="w-full text-xs text-gray-500 hover:text-gray-800 transition-colors"
												>
													Clear Filter
												</Button>
											)}
										</div>
									</PopoverContent>
								</Popover>
							)}
							{/* ...existing code for viewLink, editDialog, deleteDialog... */}
							{viewLink ? (
								<div>
									{React.cloneElement(
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										viewLink as React.ReactElement<any>,
										{
											disabled:
												selectedRowCount === 1
													? false
													: true,
											href: `/Portal/${
												selectedRowsData[0]?.ledaId
													? "Management"
													: "Maintenance"
											}/**REPLACE**/${
												selectedRowsData[0]?.ledaId ??
												selectedRowsData[0]?.seasonCode
											}`,
										}
									)}
								</div>
							) : null}
							{editDialog ? (
								<div>
									{React.cloneElement(
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										editDialog as React.ReactElement<any>,
										{
											disabled:
												selectedRowCount === 1
													? false
													: true,
											rowData: selectedRowsData[0], // Pass the first selected row's data
											onRefresh: handleRefresh,
										}
									)}
								</div>
							) : null}
							{deleteDialog ? (
								<div>
									{React.cloneElement(
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										deleteDialog as React.ReactElement<any>,
										{
											selectedRowCount,
											disabled:
												selectedRowCount > 0
													? false
													: true,
											rowData: selectedRowsData, // Pass the selected rows' data
											onRefresh: handleRefresh,
										}
									)}
								</div>
							) : null}
						</div>
					</div>
					{/* Search Input */}
					<div className="mb-4">
						<div className="flex gap-2">
							<Input
								ref={searchInputRef}
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={handleSearchKeyDown}
								placeholder="Search... (Press Esc to clear)"
								className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all"
							/>
							<Button
								onClick={executeSearch}
								variant="outline"
								className="px-4 hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
							>
								Search
							</Button>
							{(searchQuery || activeSearchQuery) && (
								<Button
									onClick={clearSearch}
									variant="outline"
									className="px-4 hover:bg-red-100 border-red-300 text-red-700 transition-colors"
								>
									Clear
								</Button>
							)}
						</div>
					</div>

					<div className="border border-gray-200 rounded-lg overflow-hidden relative">
						<Table className="min-w-full">
							<TableHeader className="bg-gray-50 border-b">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow
										key={headerGroup.id}
										className="border-gray-200"
									>
										{headerGroup.headers.map((header) => {
											const isSelectColumn = header.column.columnDef.id === "select";
											const displayName = isSelectColumn ? "" : getColumnDisplayName(header.column.columnDef);
											
											return (
												<TableHead
													key={header.id}
													className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
													onContextMenu={isSelectColumn ? undefined : (e) => handleColumnRightClick(e, displayName)}
													style={{ userSelect: 'none' }}
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column
																	.columnDef
																	.header,
																header.getContext()
														  )}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
											data-state={
												row.getIsSelected() &&
												"selected"
											}
										>
											{row
												.getVisibleCells()
												.map((cell) => {
													const columnKey = cell.column.id;
													const isSelectColumn = columnKey === "select";
													const columnName = isSelectColumn ? "" : getColumnDisplayName(cell.column.columnDef);
													const cellValue = cell.getValue();
												
													return (
														<TableCell
															key={cell.id}
															className="px-6 py-3 text-sm text-gray-700"
															onContextMenu={isSelectColumn ? undefined : (e) => 
																handleCellRightClick(e, columnKey, columnName, cellValue)
															}
														>
															{flexRender(
																cell.column
																	.columnDef.cell,
																cell.getContext()
															)}
														</TableCell>
													);
												})}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center text-gray-500"
										>
											No Results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>

						{/* Column Header Context Menu */}
						{contextMenu.show && (
							<div
								className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
								style={{
									left: contextMenu.x,
									top: contextMenu.y,
								}}
								onClick={(e) => e.stopPropagation()}
							>
								<button
									className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
									onClick={handleAddToSearch}
								>
									Add &quot;{contextMenu.columnName}&quot; to search
								</button>
							</div>
						)}

						{/* Row Cell Context Menu */}
						{rowContextMenu.show && (
							<div
								className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
								style={{
									left: rowContextMenu.x,
									top: rowContextMenu.y,
								}}
								onClick={(e) => e.stopPropagation()}
							>
								<button
									className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
									onClick={handleAddCellToSearch}
								>
									Add &quot;{rowContextMenu.columnName}&quot; = &quot;{rowContextMenu.cellValue}&quot; to search
								</button>
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center justify-between space-x-2 py-4 mt-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							table.previousPage();
							const newIndex = table.getState().pagination.pageIndex - 1;
							setPageIndex(newIndex);
							localStorage.setItem(pageIndexStorageKey, newIndex.toString());
						}}
						disabled={!table.getCanPreviousPage()}
						className="hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
					>
						Previous
					</Button>
					<div className="text-sm text-gray-500">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							table.nextPage();
							const newIndex = table.getState().pagination.pageIndex + 1;
							setPageIndex(newIndex);
							localStorage.setItem(pageIndexStorageKey, newIndex.toString());
						}}
						disabled={!table.getCanNextPage()}
						className="hover:bg-gray-100 border-gray-300 text-gray-700 transition-colors"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}