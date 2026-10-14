/**
 * DartLogo component — renders the Lake Erie Dart Association branding header
 * with a globe icon and the association name in the Lusitana font.
 */
import { Globe } from "lucide-react";
import { lusitana } from "./fonts";

export default function DartLogo() {
    return (
        <div
            className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
        >
            <Globe className="h-12 w-12 rotate-[15deg]" />
            <p className="text-[24px]">Lake Erie Dart Association</p>
        </div>
    );
}


