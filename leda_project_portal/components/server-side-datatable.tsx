"use client";

import * as React from "react";
import { DialogWithButton } from "@/components/dialog-with-button";
import AlertDialogDelete from "@/components/alert-dialog-delete";
import CustomLink from "@/components/ui/custom-link";
import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getSortedRowModel,
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
import { Spinner } from "@/components/ui/skeleton";
import { playerRoute } from "@/lib/apiRoutes";

/* eslint-disable @typescript-eslint/no-explicit-any */

type keyofFormComponents =
	| "PlayerAddInformationForm"
	| "PlayerEditInformationForm"
	| "PlaceAddForm"
	| "PlaceEditForm"
	| "TeamAddForm"
	| "TeamEditForm";

interface ServerSideDataTableProps<TData extends Record<string, unknown>, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pageName: string;
	addDialogConfig?: { form: keyofFormComponents; title: string; buttonName: string };
	editDialogConfig?: { form: keyofFormComponents; title: string; buttonName: string };
	deleteDialogConfig?: { buttonName: string; title: string; apiEndpoint: string };
	viewLinkConfig?: { linkName: string; parentPage: string };
	defaultSort?: string;
	// Server-side props
	isLoading?: boolean;
	totalPages: number;
	currentPage: number;
	onPageChange: (page: number) => void;
	onSearchChange: (search: string) => void;
	searchValue: string;
}

export function ServerSideDataTable<TData extends Record<string, unknown>, TValue>({
	columns,
	data,
	pageName,
	addDialogConfig,
	editDialogConfig,
	deleteDialogConfig,
	viewLinkConfig,
	defaultSort,
	isLoading = false,
	totalPages,
	currentPage,
	onPageChange,
	onSearchChange,
	searchValue,
}: ServerSideDataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = React.useState(searchValue);
	const [rowSelection, setRowSelection] = React.useState({});
	const [selectedRowCount, setSelectedRowCount] = React.useState(0);

	const searchInputRef = React.useRef<HTMLInputElement>(null);

	// Debounced search
	const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	// Add state for context menus
	const [contextMenu, setContextMenu] = React.useState<{
		show: boolean;
		x: number;
		y: number;
		columnName: string;
	}>({ show: false, x: 0, y: 0, columnName: "" });

	const [rowContextMenu, setRowContextMenu] = React.useState<{
		show: boolean;
		x: number;
		y: number;
		columnKey: string;
		columnName: string;
		cellValue: string;
	}>({ show: false, x: 0, y: 0, columnKey: "", columnName: "", cellValue: "" });
	
	const executeSearch = React.useCallback(() => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}
		searchTimeoutRef.current = setTimeout(() => {
			onSearchChange(searchQuery);
			onPageChange(1); // Reset to first page on search
		}, 500); // 500ms debounce
	}, [searchQuery, onSearchChange, onPageChange]);

	const clearSearch = React.useCallback(() => {
		setSearchQuery("");
		onSearchChange("");
		onPageChange(1);
	}, [onSearchChange, onPageChange]);

	const handleSearchKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
			onSearchChange(searchQuery);
			onPageChange(1);
		} else if (e.key === 'Escape') {
			clearSearch();
		}
	}, [searchQuery, onSearchChange, onPageChange, clearSearch]);

	// Trigger search as user types (debounced)
	React.useEffect(() => {
		executeSearch();
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchQuery]);

	// Helper function to extract text from React elements
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

	// Handle adding cell value to search with exact match
	const handleAddCellToSearchExact = React.useCallback(() => {
		const { columnName, cellValue } = rowContextMenu;
		
		// Check if this field is already in the search query with IN operator
		const inPattern = new RegExp(`"${columnName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}"\\s+IN\\s*\\(([^)]+)\\)`, 'i');
		const inMatch = searchQuery.match(inPattern);
		
		if (inMatch) {
			// Field exists with IN operator, add to its values
			const existingValues = inMatch[1];
			const newSearchQuery = searchQuery.replace(
				inPattern,
				`"${columnName}" IN (${existingValues}, "${cellValue}")`
			);
			setSearchQuery(newSearchQuery);
		} else {
			// Check if exact match exists
			const exactPattern = new RegExp(`"${columnName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}"\\s*=\\s*"([^"]+)"`);
			const exactMatch = searchQuery.match(exactPattern);
			
			if (exactMatch) {
				// Convert exact match to IN operator with both values
				const existingValue = exactMatch[1];
				const newSearchQuery = searchQuery.replace(
					exactPattern,
					`"${columnName}" IN ("${existingValue}", "${cellValue}")`
				);
				setSearchQuery(newSearchQuery);
			} else {
				// Field doesn't exist, add new exact match
				const searchPattern = `"${columnName}"="${cellValue}"`;
				const newSearchQuery = searchQuery 
					? `${searchQuery} and ${searchPattern}`
					: searchPattern;
				setSearchQuery(newSearchQuery);
			}
		}
		
		setRowContextMenu({ show: false, x: 0, y: 0, columnKey: "", columnName: "", cellValue: "" });
	}, [rowContextMenu, searchQuery]);

	// Handle adding cell value to search with contains/partial match
	const handleAddCellToSearchContains = React.useCallback(() => {
		const { columnName, cellValue } = rowContextMenu;
		
		// Check if reverse IN pattern already exists for this field
		const reverseInPattern = new RegExp(`\\(([^)]+)\\)\\s+IN\\s+"${columnName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i');
		const reverseInMatch = searchQuery.match(reverseInPattern);
		
		if (reverseInMatch) {
			// Pattern exists, add to the values list
			const existingValues = reverseInMatch[1];
			const newSearchQuery = searchQuery.replace(
				reverseInPattern,
				`(${existingValues}, "${cellValue}") IN "${columnName}"`
			);
			setSearchQuery(newSearchQuery);
		} else {
			// Check if single value reverse IN exists
			const singleReverseInPattern = new RegExp(`"([^"]+)"\\s+IN\\s+"${columnName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i');
			const singleReverseInMatch = searchQuery.match(singleReverseInPattern);
			
			if (singleReverseInMatch) {
				// Convert single value to multiple values
				const existingValue = singleReverseInMatch[1];
				const newSearchQuery = searchQuery.replace(
					singleReverseInPattern,
					`("${existingValue}", "${cellValue}") IN "${columnName}"`
				);
				setSearchQuery(newSearchQuery);
			} else {
				// No existing pattern, create new single value reverse IN
				const searchPattern = `"${cellValue}" IN "${columnName}"`;
				const newSearchQuery = searchQuery 
					? `${searchQuery} and ${searchPattern}`
					: searchPattern;
				setSearchQuery(newSearchQuery);
			}
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

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		manualPagination: true, // Important for server-side pagination
		pageCount: totalPages,
		state: {
			sorting,
			rowSelection,
		},
		initialState: {
			sorting: [{ id: defaultSort || "", desc: false }],
		},
	});

	const selectedRowsData = React.useMemo(() => {
		const selectedRowIds = Object.keys(rowSelection);
		return table
			.getRowModel()
			.rows.filter((row) => selectedRowIds.includes(row.id))
			.map((row) => row.original);
	}, [rowSelection, table]);

	React.useEffect(() => {
		setSelectedRowCount(Object.keys(rowSelection).length);
	}, [rowSelection]);

	// Refresh handler
	const handleRefresh = () => {
		onPageChange(currentPage); // Trigger refetch
		setRowSelection({});
	};

	return (
		<div className="w-full">
			<div className="p-5 shadow-sm bg-background rounded-xl border border-border w-full transition-all">
				<div className="overflow-hidden rounded-lg">
					<h1 className="text-2xl font-medium pb-4 text-center text-foreground">
						{pageName}
					</h1>
					<div className="flex items-center justify-between space-x-3 mb-4">
						{addDialogConfig && (
							<DialogWithButton
								form={addDialogConfig.form}
								title={addDialogConfig.title}
								buttonName={addDialogConfig.buttonName}
								onRefresh={handleRefresh}
							/>
						)}
						<div className="flex space-x-2">
							{viewLinkConfig && (
								<CustomLink
									linkName={viewLinkConfig.linkName}
									parentPage={viewLinkConfig.parentPage}
									disabled={selectedRowCount !== 1}
									href={`/Portal/${selectedRowsData[0]?.ledaId ? "Management" : "Maintenance"}/**REPLACE**/${selectedRowsData[0]?.ledaId ?? selectedRowsData[0]?.seasonCode}`}
								/>
							)}
							{editDialogConfig && (
								<DialogWithButton
									form={editDialogConfig.form}
									title={editDialogConfig.title}
									buttonName={editDialogConfig.buttonName}
									onRefresh={handleRefresh}
									rowData={selectedRowsData[0]}
									disabled={selectedRowCount !== 1}
								/>
							)}
							{deleteDialogConfig && (
								<AlertDialogDelete
									buttonName={deleteDialogConfig.buttonName}
									title={deleteDialogConfig.title}
									apiEndpoint={deleteDialogConfig.apiEndpoint}
									onRefresh={handleRefresh}
									rowData={selectedRowsData}
									selectedRowCount={selectedRowCount}
									disabled={selectedRowCount === 0}
								/>
							)}
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
								className="flex-1 p-2 border border-border rounded-md shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all"
								disabled={isLoading}
							/>
							{(searchQuery || searchValue) && (
								<Button
									onClick={clearSearch}
									variant="outline"
									className="px-4 hover:bg-red-100 border-red-300 text-red-700 transition-colors"
									disabled={isLoading}
								>
									Clear
								</Button>
							)}
						</div>
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center min-h-[400px]">
							<Spinner />
						</div>
					) : (
						<div className="border border-border rounded-lg overflow-hidden relative">
							<Table className="min-w-full">
								<TableHeader className="bg-muted border-b">
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow
											key={headerGroup.id}
											className="border-border"
										>
											{headerGroup.headers.map((header) => {
												const isSelectColumn = header.column.columnDef.id === "select";
												const displayName = isSelectColumn ? "" : getColumnDisplayName(header.column.columnDef);
												
												return (
													<TableHead
														key={header.id}
														className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
														onContextMenu={isSelectColumn ? undefined : (e) => handleColumnRightClick(e, displayName)}
														style={{ userSelect: 'none' }}
													>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
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
												className="hover:bg-muted transition-colors border-b border-border last:border-0"
												data-state={row.getIsSelected() && "selected"}
											>
												{row.getVisibleCells().map((cell) => {
													const columnKey = cell.column.id;
													const isSelectColumn = columnKey === "select";
													const columnName = isSelectColumn ? "" : getColumnDisplayName(cell.column.columnDef);
													const cellValue = cell.getValue();
												
													return (
														<TableCell
															key={cell.id}
															className="px-6 py-3 text-sm text-foreground"
															onContextMenu={isSelectColumn ? undefined : (e) => 
																handleCellRightClick(e, columnKey, columnName, cellValue)
															}
														>
															{flexRender(
																cell.column.columnDef.cell,
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
												className="h-24 text-center text-muted-foreground"
											>
												No players found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>

							{/* Column Header Context Menu */}
							{contextMenu.show && (
								<div
									className="fixed bg-background border border-border rounded-md shadow-lg py-1 z-50"
									style={{
										left: contextMenu.x,
										top: contextMenu.y,
									}}
									onClick={(e) => e.stopPropagation()}
								>
									<button
										className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
										onClick={handleAddToSearch}
									>
										Add &quot;{contextMenu.columnName}&quot; to search
									</button>
								</div>
							)}

							{/* Row Cell Context Menu */}
							{rowContextMenu.show && (
								<div
									className="fixed bg-background border border-border rounded-md shadow-lg py-1 z-50"
									style={{
										left: rowContextMenu.x,
										top: rowContextMenu.y,
									}}
									onClick={(e) => e.stopPropagation()}
								>
									<button
										className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors border-b border-border"
										onClick={handleAddCellToSearchExact}
									>
										Search for exact match: &quot;{rowContextMenu.cellValue}&quot;
									</button>
									<button
										className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
										onClick={handleAddCellToSearchContains}
									>
										Search for all records containing: &quot;{rowContextMenu.cellValue}&quot;
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex items-center justify-between space-x-2 py-4 mt-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1 || isLoading}
						className="hover:bg-muted border-border text-foreground transition-colors"
					>
						Previous
					</Button>
					<div className="text-sm text-muted-foreground">
						Page {currentPage} of {totalPages}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages || isLoading}
						className="hover:bg-muted border-border text-foreground transition-colors"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
