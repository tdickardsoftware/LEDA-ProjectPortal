"use client";

/**
 * PenaltyAccordion
 *
 * Displays the collapsible list of existing penalties for a team.
 * The add/edit dialog lives in the parent; this component only renders
 * the accordion with edit and remove action icons.
 */

import { Pencil, X } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export type PenaltyRecord = Record<
	string,
	{ penaltyCode: string; points: number; notes?: string }
>;

interface PenaltyAccordionProps {
	teamId: string;
	penalties: PenaltyRecord;
	onEdit: (teamId: string, penaltyId: string) => void;
	onRemove: (teamId: string, penaltyId: string) => void;
}

export default function PenaltyAccordion({
	teamId,
	penalties,
	onEdit,
	onRemove,
}: PenaltyAccordionProps) {
	if (Object.keys(penalties).length === 0) return null;

	return (
		<Accordion type="single" collapsible className="w-full mt-2">
			<AccordionItem value="penalties">
				<AccordionTrigger className="text-sm font-medium text-red-600 dark:text-red-400">
					View Team Penalties
				</AccordionTrigger>
				<AccordionContent>
					<div className="space-y-2 p-2 border rounded-md">
						{Object.entries(penalties).map(([id, penalty]) => (
							<div
								key={id}
								className="flex justify-between items-start border-b pb-2 group relative"
							>
								<div>
									<span className="font-semibold">
										Code: {penalty.penaltyCode}
									</span>
									<p className="text-sm text-muted-foreground">
										{penalty.notes}
									</p>
								</div>
								<div className="flex items-center">
									<span className="text-red-600 dark:text-red-400 font-bold">
										{penalty.points} pts
									</span>
									<div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
										<Pencil
											className="h-4 w-4 text-blue-500 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300"
											onClick={() => onEdit(teamId, id)}
										/>
										<X
											className="h-4 w-4 text-red-500 dark:text-red-400 cursor-pointer hover:text-red-700 dark:hover:text-red-300"
											onClick={() =>
												onRemove(teamId, id)
											}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
