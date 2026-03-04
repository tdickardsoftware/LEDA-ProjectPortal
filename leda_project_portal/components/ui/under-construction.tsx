/** UnderConstruction page placeholder — displays a hard-hat icon and a message for pages that are not yet implemented. */
'use client'
import { HardHat } from "lucide-react";


export default function UnderConstruction() {
    return (
        <main>
            <div className="flex h-screen w-[80vw] flex-col items-center justify-center gap-2 text-center">
                <HardHat className="size-80"/>
                <p className="text-2xl">***UNDER CONSTRUCTION***</p>
            </div>
        </main>
    );
}