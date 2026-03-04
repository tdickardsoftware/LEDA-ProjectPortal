/**
 * Thin wrapper around `next-themes` ThemeProvider.
 * Allows the app to support light/dark mode toggling by forwarding all
 * props directly to the underlying `NextThemesProvider`.
 */
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

/**
 * Drop-in replacement for `ThemeProvider` from `next-themes`.
 * Accepts all `ThemeProviderProps` and wraps the tree so descendant
 * components can read and set the active theme via `useTheme()`.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
