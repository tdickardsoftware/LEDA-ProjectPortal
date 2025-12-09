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
import { useMutation } from "@tanstack/react-query";
import { fetchWithSession } from "@/lib/getData";

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

	const deleteMutation = useMutation({
		mutationFn: async () => {
			for (let j = 0; j < rowData.length; j++) {
				await fetchWithSession(apiEndpoint, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(rowData[j]),
				});
			}
		},
		onSuccess: () => {
			if (onRefresh) {
				onRefresh();
			}
		},
	});

	function onClickDelete() {
		deleteMutation.mutate();
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger type="button" asChild>
				<Button
					variant={"outline"}
					disabled={disabled}
					className="hover:bg-muted border-border text-foreground"
				>
					{buttonName}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="bg-background">
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
