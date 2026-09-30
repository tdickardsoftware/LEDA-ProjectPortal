"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadHtmlButtonProps {
	// Called on click so the HTML always reflects the latest data.
	getHtml: () => string;
	fileName: string;
	disabled?: boolean;
}

export default function DownloadHtmlButton({ getHtml, fileName, disabled }: DownloadHtmlButtonProps) {
	const handleClick = () => {
		const url = URL.createObjectURL(new Blob([getHtml()], { type: "text/html" }));
		const link = window.document.createElement("a");
		link.href = url;
		link.download = fileName;
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Button
			type="button"
			onClick={handleClick}
			disabled={disabled}
			className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-foreground shadow hover:bg-muted focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
		>
			<Download className="mr-2 h-4 w-4" />
			Download HTML
		</Button>
	);
}
