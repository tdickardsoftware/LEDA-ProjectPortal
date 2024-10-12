import {GlobeAmericasIcon} from "@heroicons/react/24/outline";
import { lusitana } from "./fonts";

export default function DartLogo() {
    return (
        <div
            className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
        >
            <GlobeAmericasIcon className="h-12 w-12 rotate-[15deg]" />
            <p className="text-[24px]">Lake Erie Dart Association</p>
        </div>
    );
}


