"use client";

/**
 * SidenavPageLayout
 *
 * A reusable layout shell that provides the standard sidenav + main content
 * area pattern used across tools like weekly scoresheets, scheduling, and
 * other division/subdivision-based pages.
 *
 * Slot overview:
 *  - `header`      — optional content rendered above the separator
 *                    (e.g. season/week selectors wrapped in FolderTabMed)
 *  - `sidenav`     — the left-hand navigation panel; pass any component
 *                    (SideNav, DivisionTreeSidenav, etc.)
 *  - `children`    — the main content area rendered to the right of the sidenav
 *  - `emptyContent`— shown in the main area instead of children when
 *                    `showContent` is false
 *  - `showContent` — controls whether children or emptyContent is rendered
 */

import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

export interface SidenavPageLayoutProps {
	/** Optional toolbar / selector bar rendered above the separator. */
	header?: ReactNode;
	/** The sidenav panel. Rendered at a fixed width determined by the sidenav itself. */
	sidenav: ReactNode;
	/** Main content shown when showContent is true (default). */
	children: ReactNode;
	/**
	 * Fallback rendered in the main area when showContent is false.
	 * Defaults to a centered "Select an item to continue…" message.
	 */
	emptyContent?: ReactNode;
	/**
	 * When false the emptyContent placeholder is shown instead of children.
	 * Defaults to true.
	 */
	showContent?: boolean;
	/** Additional className applied to the outermost wrapper div. */
	className?: string;
}

export default function SidenavPageLayout({
	header,
	sidenav,
	children,
	emptyContent,
	showContent = true,
	className = "",
}: SidenavPageLayoutProps) {
	return (
		<div className={`flex flex-col h-full ${className}`}>
			{header && (
				<>
					{header}
					<div className="mt-4">
						<Separator orientation="horizontal" className="bg-muted w-100" />
					</div>
				</>
			)}
			<div className="flex flex-1 overflow-hidden">
				{sidenav}
				<div className="flex-1 p-4 overflow-auto">
					{showContent ? (
						children
					) : (
						emptyContent ?? (
							<div className="flex h-full items-center justify-center">
								<p className="text-muted-foreground text-center">
									Select an item to continue…
								</p>
							</div>
						)
					)}
				</div>
			</div>
		</div>
	);
}
