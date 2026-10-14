/**
 * HelpMarkdown — renders a help-wiki markdown string using the already-installed
 * @uiw/react-md-editor preview, following the current light/dark theme.
 */
"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Markdown = dynamic(
	() => import("@uiw/react-md-editor").then((m) => m.default.Markdown),
	{ ssr: false }
);

export function HelpMarkdown({ source }: { source: string }) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	// The theme is only known client-side; wait to avoid a hydration mismatch.
	if (!mounted) return null;
	return (
		<div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}>
			<Markdown source={source} style={{ background: "transparent" }} />
		</div>
	);
}
