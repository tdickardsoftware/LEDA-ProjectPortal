import "@/app/ui/globals.css";
import { Metadata } from "next";
import QueryProvider from "@/providers/query-provider";

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
		<html lang="en">
			<body>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
