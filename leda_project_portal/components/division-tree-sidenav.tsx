"use client";

/**
 * DivisionTreeSidenav
 *
 * A reusable sidenav component that renders a hierarchical collapsible tree:
 *   Division  ▸  Subdivision  ▸  (optional) Leaf items
 *
 * Uses the same Collapsible + Button pattern as the weekly scoresheet sidenav
 * so the visual style is consistent across tools.
 *
 * Two selection modes are supported:
 *
 *  1. **Leaf-item mode** — when a subdivision contains `items`, each item is a
 *     selectable button.  Pass `onItemSelect` and optionally `selectedItemKey`.
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
	key: string;
	label: ReactNode;
	disabled?: boolean;
	statusIcon?: ReactNode;
}

export interface DivisionTreeSubdivision {
	name: string;
	items?: DivisionTreeItem[];
	/** Optional node rendered to the right of the subdivision label (e.g. a delete button). */
	actions?: ReactNode;
}

export interface DivisionTreeDivision {
	name: string;
	subdivisions: DivisionTreeSubdivision[];
	/** Optional node rendered to the right of the division label (e.g. a delete button). */
	actions?: ReactNode;
	/** Optional node rendered at the bottom of the subdivision list (e.g. an "Add Subdivision" button). */
	footer?: ReactNode;
}

export interface DivisionTreeSidenavProps {
	divisions: DivisionTreeDivision[];
	onItemSelect?: (
		divisionName: string,
		subdivisionName: string,
		itemKey: string
	) => void;
	selectedItemKey?: string | null;
	onSubdivisionSelect?: (
		divisionName: string,
		subdivisionName: string
	) => void;
	selectedSubdivision?: {
		divisionName: string;
		subdivisionName: string;
	} | null;
	collapseOnSelection?: boolean;
	resetToken?: number;
	emptyMessage?: string;
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
	const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>({});
	const [openSubdivisions, setOpenSubdivisions] = useState<Record<string, boolean>>({});

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
							<div className="flex items-center w-full">
								<CollapsibleTrigger asChild>
									<Button
										variant="ghost"
										className="flex-1 justify-between font-medium text-lg p-2 h-auto"
									>
										{division.name}
										{openDivisions[division.name] ? (
											<ChevronDown className="h-4 w-4" />
										) : (
											<ChevronRight className="h-4 w-4" />
										)}
									</Button>
								</CollapsibleTrigger>
								{division.actions && (
									<div
										onClick={(e) => e.stopPropagation()}
										className="shrink-0 pl-1"
									>
										{division.actions}
									</div>
								)}
							</div>

							<CollapsibleContent className="ml-4 mt-1 space-y-1">
								{division.subdivisions.map((subdivision) => {
									const subdivKey = `${division.name}-${subdivision.name}`;
									const hasItems = subdivision.items && subdivision.items.length > 0;

									if (!hasItems) {
										const isSelected =
											selectedSubdivision?.divisionName === division.name &&
											selectedSubdivision?.subdivisionName === subdivision.name;
										return (
											<div key={subdivKey} className="flex items-center">
												<Button
													variant="ghost"
													className={`flex-1 justify-start text-base p-1 h-auto ${
														isSelected
															? "bg-secondary cursor-not-allowed opacity-75"
															: "hover:bg-muted"
													}`}
													disabled={isSelected}
													aria-disabled={isSelected}
													onClick={() => {
														if (isSelected) return;
														onSubdivisionSelect?.(division.name, subdivision.name);
														if (collapseOnSelection) collapseAll();
													}}
												>
													{subdivision.name}
												</Button>
												{subdivision.actions && (
													<div
														onClick={(e) => e.stopPropagation()}
														className="shrink-0 pl-1"
													>
														{subdivision.actions}
													</div>
												)}
											</div>
										);
									}

									return (
										<Collapsible
											key={subdivKey}
											open={!!openSubdivisions[subdivKey]}
											onOpenChange={() => toggleSubdivision(division.name, subdivision.name)}
											className="pb-1"
										>
											<div className="flex items-center w-full">
												<CollapsibleTrigger asChild>
													<Button
														variant="ghost"
														className="flex-1 justify-between text-base p-1 h-auto"
													>
														{subdivision.name}
														{openSubdivisions[subdivKey] ? (
															<ChevronDown className="h-3 w-3" />
														) : (
															<ChevronRight className="h-3 w-3" />
														)}
													</Button>
												</CollapsibleTrigger>
												{subdivision.actions && (
													<div
														onClick={(e) => e.stopPropagation()}
														className="shrink-0 pl-1"
													>
														{subdivision.actions}
													</div>
												)}
											</div>

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
																onItemSelect?.(division.name, subdivision.name, item.key);
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
								{division.footer && (
									<div className="mt-2 pt-2 border-t border-border/40">
										{division.footer}
									</div>
								)}
							</CollapsibleContent>
						</Collapsible>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
