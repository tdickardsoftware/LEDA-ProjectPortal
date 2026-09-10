/**
 * Root layout for the entire application.
 * Wraps all pages with global CSS, theme support (light/dark via next-themes),
 * and the React Query provider for client-side data fetching.
 */
import "@/app/ui/globals.css";
import "@uiw/react-md-editor/markdown-editor.css";
import { Metadata } from "next";
import QueryProvider from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import InactivityTimeoutProvider from "@/providers/inactivity-timeout-provider";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: {
		template: "%s | LEDA Project Portal",
		default: "LEDA Portal",
	},
	description: "The official Next.js Learn Dashboard built with App Router.",
	metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
	icons: {
		icon: "/leda-reports-logo.ico",
		shortcut: "/leda-reports-logo.ico",
		apple: "/leda-reports-logo.ico",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
					storageKey="leda-portal-theme"
					enableColorScheme
				>
					<QueryProvider>
					<InactivityTimeoutProvider>
						{children}
					</InactivityTimeoutProvider>
				</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
