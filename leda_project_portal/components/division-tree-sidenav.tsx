"use client";

/**
 * DivisionTreeSidenav
 *
 * A reusable sidenav component that renders a hierarchical collapsible tree:
 *   Division  ▸  Subdivision  ▸  (optional) Leaf items
 *
 * Uses the same Collapsible + Button pattern as the weekly scoresheet sidenav
 * (as opposed to the shadcn Accordion used on the schedule page) so the visual
 * style is consistent across tools.
 *
 * Two selection modes are supported:
 *
 *  1. **Leaf-item mode** — when a subdivision contains `items`, each item is a
 *     selectable button.  Pass `onItemSelect` and optionally `selectedItemKey`
 *     (a unique key string across all items in the tree).
 *
 *  2. **Subdivision mode** — when a subdivision has no `items`, the subdivision
 *     row itself is the selectable unit.  Pass `onSubdivisionSelect` and
 *     optionally `selectedSubdivision`.
 *
 * Both modes can coexist within the same tree (mixed data is supported).
 */

import { useState, useEffect, ReactNode } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ---------------------------------------------------------------------------
// Public types — exported so callers can import them alongside the component
// ---------------------------------------------------------------------------

export interface DivisionTreeItem {
	/** Unique key for this item across the entire tree. */
	key: string;
	/** Display label — accepts a string or any React node. */
	label: ReactNode;
	/** When true the item is rendered but cannot be clicked. */
	disabled?: boolean;
	/**
	 * Optional icon rendered to the right of the label.
	 * Typically a CheckCircle or AlertTriangle icon indicating status.
	 */
	statusIcon?: ReactNode;
}

export interface DivisionTreeSubdivision {
	name: string;
	/**
	 * Leaf items inside this subdivision.
	 * When omitted (or empty), the subdivision row itself becomes selectable.
	 */
	items?: DivisionTreeItem[];
}

export interface DivisionTreeDivision {
	name: string;
	subdivisions: DivisionTreeSubdivision[];
}

export interface DivisionTreeSidenavProps {
	divisions: DivisionTreeDivision[];

	// --- Leaf-item mode ---
	/** Called when a leaf item is clicked. */
	onItemSelect?: (
		divisionName: string,
		subdivisionName: string,
		itemKey: string
	) => void;
	/** Key of the currently selected leaf item (controls disabled/highlight state). */
	selectedItemKey?: string | null;

	// --- Subdivision mode ---
	/** Called when a subdivision row (with no items) is clicked. */
	onSubdivisionSelect?: (
		divisionName: string,
		subdivisionName: string
	) => void;
	/** Currently selected subdivision (controls disabled/highlight state). */
	selectedSubdivision?: {
		divisionName: string;
		subdivisionName: string;
	} | null;

	// --- Behaviour ---
	/**
	 * When true, the entire tree collapses after a selection is made.
	 * Defaults to false.
	 */
	collapseOnSelection?: boolean;
	/**
	 * Incrementing this number resets all expanded/selected visual state
	 * (useful when season or week changes upstream).
	 */
	resetToken?: number;

	// --- Presentation ---
	/** Placeholder text shown when `divisions` is empty or undefined. */
	emptyMessage?: string;
	/** Width class applied to the outer wrapper. Defaults to "w-64". */
	widthClass?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DivisionTreeSidenav({
	divisions,
	onItemSelect,
	selectedItemKey,
	onSubdivisionSelect,
	selectedSubdivision,
	collapseOnSelection = false,
	resetToken,
	emptyMessage = "No data available.",
	widthClass = "w-64",
}: DivisionTreeSidenavProps) {
	const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>(
		{}
	);
	const [openSubdivisions, setOpenSubdivisions] = useState<
		Record<string, boolean>
	>({});

	// Reset open/selected state whenever the caller increments resetToken
	useEffect(() => {
		setOpenDivisions({});
		setOpenSubdivisions({});
	}, [resetToken]);

	const toggleDivision = (name: string) =>
		setOpenDivisions((prev) => ({ ...prev, [name]: !prev[name] }));

	const toggleSubdivision = (divName: string, subName: string) =>
		setOpenSubdivisions((prev) => {
			const key = `${divName}-${subName}`;
			return { ...prev, [key]: !prev[key] };
		});

	const collapseAll = () => {
		setOpenDivisions({});
		setOpenSubdivisions({});
	};

	// Empty / loading state
	if (!divisions || divisions.length === 0) {
		return (
			<div
				className={`${widthClass} border-r h-full flex items-center justify-center p-4`}
			>
				<p className="text-muted-foreground text-center">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className={widthClass}>
			<ScrollArea className="h-full">
				<div className="p-4 space-y-2">
					{divisions.map((division) => (
						<Collapsible
							key={division.name}
							open={!!openDivisions[division.name]}
							onOpenChange={() => toggleDivision(division.name)}
							className="border-b border-border pb-2"
						>
							<CollapsibleTrigger asChild>
								<Button
									variant="ghost"
									className="w-full justify-between font-medium text-lg p-2 h-auto"
								>
									{division.name}
									{openDivisions[division.name] ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</Button>
							</CollapsibleTrigger>

							<CollapsibleContent className="ml-4 mt-1 space-y-1">
								{division.subdivisions.map((subdivision) => {
									const subdivKey = `${division.name}-${subdivision.name}`;
									const hasItems =
										subdivision.items && subdivision.items.length > 0;

									// -------------------------------------------------------
									// Subdivision mode — no leaf items, subdivision is the unit
									// -------------------------------------------------------
									if (!hasItems) {
										const isSelected =
											selectedSubdivision?.divisionName === division.name &&
											selectedSubdivision?.subdivisionName ===
												subdivision.name;

										return (
											<Button
												key={subdivKey}
												variant="ghost"
												className={`w-full justify-start text-base p-1 h-auto ${
													isSelected
														? "bg-secondary cursor-not-allowed opacity-75"
														: "hover:bg-muted"
												}`}
												disabled={isSelected}
												aria-disabled={isSelected}
												onClick={() => {
													if (isSelected) return;
													onSubdivisionSelect?.(
														division.name,
														subdivision.name
													);
													if (collapseOnSelection) collapseAll();
												}}
											>
												{subdivision.name}
											</Button>
										);
									}

									// -------------------------------------------------------
									// Leaf-item mode — subdivision is a collapsible group
									// -------------------------------------------------------
									return (
										<Collapsible
											key={subdivKey}
											open={!!openSubdivisions[subdivKey]}
											onOpenChange={() =>
												toggleSubdivision(division.name, subdivision.name)
											}
											className="pb-1"
										>
											<CollapsibleTrigger asChild>
												<Button
													variant="ghost"
													className="w-full justify-between text-base p-1 h-auto"
												>
													{subdivision.name}
													{openSubdivisions[subdivKey] ? (
														<ChevronDown className="h-3 w-3" />
													) : (
														<ChevronRight className="h-3 w-3" />
													)}
												</Button>
											</CollapsibleTrigger>

											<CollapsibleContent className="ml-4 mt-1 space-y-1">
												{subdivision.items!.map((item) => {
													const isSelected = selectedItemKey === item.key;
													const isDisabled = isSelected || !!item.disabled;

													return (
														<Button
															key={item.key}
															variant="ghost"
															className={`w-full justify-start text-sm p-1 h-auto ${
																isDisabled
																	? "bg-secondary cursor-not-allowed opacity-75"
																	: "hover:bg-muted"
															}`}
															disabled={isDisabled}
															aria-disabled={isDisabled}
															onClick={() => {
																if (isDisabled) return;
																onItemSelect?.(
																	division.name,
																	subdivision.name,
																	item.key
																);
																if (collapseOnSelection) collapseAll();
															}}
														>
															<div className="flex items-center gap-2">
																<span>{item.label}</span>
																{item.statusIcon}
															</div>
														</Button>
													);
												})}
											</CollapsibleContent>
										</Collapsible>
									);
								})}
							</CollapsibleContent>
						</Collapsible>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
