//
// use client
//
'use client'
//
// imports
//
import { useState } from "react"
import PlayerAddInformationForm from "./player-info-form"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { toast } from 'sonner';
import PlaceAddForm from "./place-add-form"
//
// Interface
//
interface DialogWithButtonProps{
    buttonName: string
    form: string
    title: string
    onRefresh: () => void
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