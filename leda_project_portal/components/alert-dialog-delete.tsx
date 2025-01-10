'use client'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

interface AlertDialogDeleteProps {
    buttonName: string;
    title: string;
	selectedRowCount?: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rowData?: any;
	disabled?: boolean;
}

export default function AlertDialogDelete({ buttonName, title, selectedRowCount, disabled }: AlertDialogDeleteProps) {
	const [currentSelectedRowCount, setCurrentSelectedRowCount] = useState(0);

	useEffect(() => {
		setCurrentSelectedRowCount(selectedRowCount || 0);
	}, [selectedRowCount]);

	return (
		<AlertDialog>
			<AlertDialogTrigger type="button" asChild>
				<Button variant={"outline"} disabled={disabled}>{buttonName}</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="bg-white">
				<AlertDialogHeader>
					<AlertDialogTitle>
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete {currentSelectedRowCount} row(s)?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<div className="flex justify-between w-full">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction className="bg-red-600">Delete</AlertDialogAction>
					</div>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
