import React from "react";

interface FolderTabProps {
	title: string;
	children: React.ReactNode;
	className?: string;
}

const FolderTab: React.FC<FolderTabProps> = ({ title, children }) => {
	return (
        <div className="relative bg-gray-100 rounded-lg shadow-md border border-gray-300">
            <div className="absolute -top-3 left-4 bg-gray-200 px-3 py-1 rounded-t-md text-gray-800 font-semibold border border-gray-300">
                {title}
            </div>
            <div className="p-4">{children}</div>
        </div>
	);
};

export const FolderTabMed: React.FC<FolderTabProps> = ({ title, children, className }) => {
    return (
        <div className={`relative bg-gray-100 rounded-lg shadow-md border border-gray-300 ${className || ""}`}>
            <div className="absolute -top-3 left-4 bg-gray-200 px-3 py-1 rounded-t-md text-gray-800 font-semibold border border-gray-300">
                {title}
            </div>
            <div className="p-8">{children}</div>
        </div>
    );
}

export default FolderTab;
