/**
 * General-purpose utility helpers.
 *
 * Currently exports `cn`, the standard shadcn/ui class-merging helper
 * that combines clsx conditional logic with Tailwind's conflict resolution.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, resolving conflicts via tailwind-merge
 * and supporting conditional class logic via clsx.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Returns a Date whose local fields (year/month/day/hour) show the current Eastern time. */
export const getEasternTime = (date = new Date()) =>
	new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
