//
// use client
//
'use client'
//
// imports
//
import { useState } from "react"
import { PlayerAddInformationForm } from "./player-info-form"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
//
// Interface
//
interface DialogWithButtonProps{
    buttonName: string
    form: string
    title: string
}
//
// function
//
export function DialogWithButton({buttonName, form, title}:DialogWithButtonProps) {
    const [activeForm, setActiveForm] = useState<string>("PlayerAddInformationForm");

    function rednerForm() {
        if (activeForm === 'PlayerAddInformationForm') {
            return <PlayerAddInformationForm />
        }
    }
    return(
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" onClick={() => setActiveForm(form)}>{buttonName}</Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {rednerForm()}
            </DialogContent>
        </Dialog>
    )
}