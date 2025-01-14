//
// use client
//
"use client";
//
// imports
//
import { useState } from "react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import PlayerAddInformationForm from "@/components/forms/management/player-info-form";
import PlaceAddForm from "@/components/forms/management/place-add-form";
import TeamAddForm from "@/components/forms/management/team-add-form";
import DivisionAddForm from "@/components/forms/maintenance/division-add-form";
import MentionAddForm from "@/components/forms/maintenance/mention-add-form";
import PaymentTypeAddForm from "@/components/forms/maintenance/payment-type-add-form";
import PayoutTierAddForm from "@/components/forms/maintenance/payout-tier-add-form";
import PenaltyAddForm from "@/components/forms/maintenance/penalty-add-form";
import PeopleTypeAddForm from "@/components/forms/maintenance/people-type-add-form";
import PlaceTypeAddForm from "@/components/forms/maintenance/place-type-add-form";
import SeasonAddForm from "@/components/forms/maintenance/season-add-form";
import React from "react";
import PlayerEditInformationForm from "./forms/management/player-edit-form";
//
// Interface
//
const formComponents = {
	PlayerAddInformationForm: PlayerAddInformationForm,
	PlayerEditInformationForm: PlayerEditInformationForm,
	PlaceAddForm: PlaceAddForm,
	TeamAddForm: TeamAddForm,
	DivisionAddForm: DivisionAddForm,
	MentionAddForm: MentionAddForm,
	PaymentTypeAddForm: PaymentTypeAddForm,
	PayoutTierAddForm: PayoutTierAddForm,
	PenaltyAddForm: PenaltyAddForm,
	PeopleTypeAddForm: PeopleTypeAddForm,
	PlaceTypeAddForm: PlaceTypeAddForm,
	SeasonAddForm: SeasonAddForm,
};

interface DialogWithButtonProps {
	buttonName: string;
	form: keyof typeof formComponents;
	title: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onRefresh?: any; //() => void
	disabled?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rowData?: any;
}
//
// function
//
export function DialogWithButton({
	buttonName,
	form,
	title,
	onRefresh,
	disabled,
	rowData,
}: DialogWithButtonProps) {
	const [activeForm, setActiveForm] = useState<keyof typeof formComponents>(
		"PlayerAddInformationForm"
	);
	const [open, setOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function renderForm(rowData?: any) {
		const FormComponent = formComponents[activeForm];
		if (FormComponent) {
			return (
				<FormComponent
					onClose={() => {
						setOpen(false);
					}}
					onRefresh={onRefresh}
					rowData={rowData}
				/>
			);
		}
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" onClick={() => setActiveForm(form)} disabled={disabled}>
					{buttonName}
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-white max-w-full w-fit max-h-full h-fit">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{renderForm(rowData)}
			</DialogContent>
		</Dialog>
	);
}
