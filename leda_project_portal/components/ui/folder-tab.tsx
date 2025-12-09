import React from "react";

interface FolderTabProps {
	title: string;
	children: React.ReactNode;
	className?: string;
}

const FolderTab: React.FC<FolderTabProps> = ({ title, children }) => {
	return (
		<div className="relative bg-muted rounded-lg shadow-md border border-border">
			<div className="absolute -top-3 left-4 bg-secondary px-3 py-1 rounded-t-md text-foreground font-semibold border border-border">
				{title}
			</div>
			<div className="p-4">{children}</div>
		</div>
	);
};

export const FolderTabMed: React.FC<FolderTabProps> = ({
	title,
	children,
	className,
}) => {
	return (
		<div
			className={`relative bg-muted rounded-lg shadow-md border border-border ${
				className || ""
			}`}
		>
			<div className="absolute -top-3 left-4 bg-secondary px-3 py-1 rounded-t-md text-foreground font-semibold border border-border text-sm">
				{title}
			</div>
			<div className="p-8">{children}</div>
		</div>
	);
};

export default FolderTab;
