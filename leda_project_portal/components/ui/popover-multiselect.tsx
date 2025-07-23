import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { MailingList } from "@/lib/definitions";

interface Item {
	ledaId: string;
	name: string;
	addressLineOne?: string;
	addressLineTwo?: string;
	type?: string;
}

export function PopoverMultiSelect({
	apiRoute,
	label,
	selected,
	setSelected,
	type,
}: {
	apiRoute: string;
	label: string;
	selected: MailingList[];
	setSelected: (items: MailingList[]) => void;
	type: string;
}) {
	const { data = [], isLoading } = useQuery<Item[]>({
		queryKey: [apiRoute],
		queryFn: async () => {
			const res = await fetch(apiRoute);
			if (!res.ok) throw new Error("Failed to fetch");
			return res.json();
		},
		staleTime: 60 * 1000,
	});

	const [popoverOpen, setPopoverOpen] = useState(false);

	const selectedIds = selected.map((item) => item.ledaId);

	const handleToggle = (id: string) => {
		const item = data.find((i) => i.ledaId === id);
		if (!item) return;
		const exists = selectedIds.includes(id);
		let newSelected: MailingList[];
		if (exists) {
			newSelected = selected.filter((i) => i.ledaId !== id);
		} else {
			newSelected = [
				...selected,
				{
					ledaId: item.ledaId,
					name: item.name,
					addressLineOne: item.addressLineOne ?? "",
					addressLineTwo: item.addressLineTwo ?? "",
					type,
				},
			];
		}
		setSelected(newSelected);
		// Close popover if all selectable rows are selected
		if (data.length > 0 && newSelected.length === data.length) {
			setPopoverOpen(false);
		}
	};

	return (
		<div className="flex flex-col w-full">
			<div className="font-semibold mb-2">{label}</div>
			<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className="w-full justify-between border-gray-200"
					>
						{selected.length > 0
							? `${selected.length} selected`
							: `Select ${label}`}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-64 p-0 bg-white">
					<ScrollArea className="h-48">
						{isLoading ? (
							<div className="text-sm text-gray-500 p-2">Loading...</div>
						) : data.length === 0 ? (
							<div className="text-sm text-gray-500 p-2">No data available to select.</div>
						) : (
							data.map((item) => (
								<div
									key={item.ledaId}
									className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
									onClick={() => handleToggle(item.ledaId)}
								>
									{selectedIds.includes(item.ledaId) ? (
										<Check className="h-4 w-4 text-primary mr-2" />
									) : (
										<span className="inline-block w-4 mr-2" />
									)}
									<span className="text-sm">{item.name}</span>
								</div>
							))
						)}
					</ScrollArea>
				</PopoverContent>
			</Popover>
			<div className="mt-2">
				{selected.length === 0 ? (
					<div className="text-xs text-gray-700">Selected: None</div>
				) : (
					<Table className="border rounded-lg bg-white shadow-sm text-xs mt-2">
						<TableHeader>
							<TableRow className="border-b border-gray-200 bg-gray-50/50">
								<TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-900">LEDA ID</TableHead>
								<TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{selected.map((item) => (
								<TableRow key={item.ledaId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
									<TableCell className="px-6 py-4 text-sm text-gray-900">{item.ledaId}</TableCell>
									<TableCell className="px-6 py-4 text-sm text-gray-900">{item.name}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
}
