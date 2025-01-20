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