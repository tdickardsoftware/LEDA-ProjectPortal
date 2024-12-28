//
// use client
//
'use client'
//
// imports
//
import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import PlayerAddInformationForm from "@/components/forms/player-info-form"
import PlaceAddForm from "@/components/forms/place-add-form"
import TeamAddForm from "@/components/forms/team-add-form"
import DivisionAddForm from "@/components/forms/division-add-form"
import MentionAddForm from "@/components/forms/mention-add-form"
//
// Interface
//
interface DialogWithButtonProps{
    buttonName: string
    form: string
    title: string
    onRefresh?: any//() => void
}
//
// function
//
export function DialogWithButton({buttonName, form, title, onRefresh}:DialogWithButtonProps) {
    const [activeForm, setActiveForm] = useState<string>("PlayerAddInformationForm");
    const [open, setOpen] = useState(false);

    function renderForm() {
        if (activeForm === 'PlayerAddInformationForm') {
            return <PlayerAddInformationForm onClose={() => { setOpen(false);}} onRefresh={onRefresh} />
        } else if (activeForm === 'PlaceAddForm') {
            return <PlaceAddForm onClose={() => { setOpen(false);}} onRefresh={onRefresh} />
        } else if (activeForm === 'TeamAddForm') {
            return <TeamAddForm onClose={() => { setOpen(false);}} onRefresh={onRefresh} />
        } else if (activeForm === 'DivisionAddForm') {
            return <DivisionAddForm onClose={() => { setOpen(false);}} onRefresh={onRefresh} />
        } else if (activeForm === 'MentionAddForm') {
            return <MentionAddForm onClose={() => { setOpen(false);}} onRefresh={onRefresh} />
        }
    }
    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" onClick={() => setActiveForm(form)}>{buttonName}</Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-full w-fit max-h-full h-fit">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {renderForm()}
            </DialogContent>
        </Dialog>
    )
}