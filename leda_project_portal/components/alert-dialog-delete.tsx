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

interface AlertDialogDeleteProps {
    buttonName: string;
    title: string;
    description: string;
}
export default function AlertDialogDelete( { buttonName, title, description }: AlertDialogDeleteProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger type="button" asChild><Button variant={"outline"}>{buttonName}</Button></AlertDialogTrigger>
			<AlertDialogContent className="bg-white">
				<AlertDialogHeader>
					<AlertDialogTitle>
						{title}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{description}
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
