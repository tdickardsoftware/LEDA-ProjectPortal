/**
 * BreadcrumbDynamicItems component
 *
 * Automatically generates a breadcrumb trail from the current URL pathname.
 * Each path segment is converted to a readable label (kebab-case → Title Case
 * by default, overridable via `transformLabel`).  Specific segments can be
 * excluded via `excludeSegments`, and the home crumb can be hidden via
 * `showHome`.  The last segment is rendered as a non-linked current-page
 * indicator.
 */
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

interface BreadcrumbDynamicItemsProps {
	/**
	 * Label for the home breadcrumb
	 * @default "Home"
	 */
	homeLabel?: string;
	/**
	 * Custom function to transform URL segments into readable labels
	 * @default Converts kebab-case to Title Case
	 */
	transformLabel?: (segment: string) => string;
	/**
	 * Segments to exclude from breadcrumb path
	 */
	excludeSegments?: string[];
	/**
	 * Whether to show the home item
	 * @default true
	 */
	showHome?: boolean;
}

export function BreadcrumbDynamicItems({
	homeLabel = "Home",
	transformLabel,
	excludeSegments = [],
	showHome = true,
}: BreadcrumbDynamicItemsProps) {
	const pathname = usePathname() || "";

	// Default transform function: convert kebab-case to Title Case
	const defaultTransform = (segment: string) =>
		segment
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

	const labelTransformer = transformLabel || defaultTransform;

	// Split the pathname into segments
	const segments = pathname
		.split("/")
		.filter(
			(segment) => segment !== "" && !excludeSegments.includes(segment)
		);

	// Generate breadcrumb paths and labels
	const breadcrumbs = segments.map((segment, index) => {
		const href = `/${segments.slice(0, index + 1).join("/")}`;
		const label = labelTransformer(segment);
		const isLast = index === segments.length - 1;

		return { href, label, isLast };
	});

	return (
		<Breadcrumb>
			<nav aria-label="breadcrumb">
				<BreadcrumbList>
					{showHome && (
						<>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href="/">{homeLabel}</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							{breadcrumbs.length > 0 && <BreadcrumbSeparator />}
						</>
					)}

					{breadcrumbs.map((breadcrumb) => (
						<React.Fragment key={breadcrumb.href}>
							<BreadcrumbItem>
								{breadcrumb.isLast ? (
									<BreadcrumbPage>
										{breadcrumb.label}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={breadcrumb.href} prefetch>
											{breadcrumb.label}
										</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!breadcrumb.isLast && <BreadcrumbSeparator />}
						</React.Fragment>
					))}
				</BreadcrumbList>
			</nav>
		</Breadcrumb>
	);
}
