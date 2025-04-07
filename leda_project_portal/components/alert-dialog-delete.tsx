"use client";
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
	apiEndpoint: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onRefresh?: any; //() => void
}

export default function AlertDialogDelete({
	buttonName,
	title,
	selectedRowCount,
	disabled,
	rowData,
	apiEndpoint,
	onRefresh,
}: AlertDialogDeleteProps) {
	const [currentSelectedRowCount, setCurrentSelectedRowCount] = useState(0);

	useEffect(() => {
		setCurrentSelectedRowCount(selectedRowCount || 0);
	}, [selectedRowCount]);

	async function onClickDelete() {
		for (let j = 0; j < rowData.length; j++) {
			await fetch(apiEndpoint, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(
					rowData[j] // Ensure targetValue is correctly passed
				),
			});
		}
		if (onRefresh) {
			onRefresh();
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger type="button" asChild>
				<Button
					variant={"outline"}
					disabled={disabled}
					className="hover:bg-gray-100 border-gray-300 text-gray-700"
				>
					{buttonName}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="bg-white">
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete{" "}
						{currentSelectedRowCount} row(s)?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<div className="flex justify-between w-full">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Button
								variant={"destructive"}
								onClick={onClickDelete}
							>
								Delete
							</Button>
						</AlertDialogAction>
					</div>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
