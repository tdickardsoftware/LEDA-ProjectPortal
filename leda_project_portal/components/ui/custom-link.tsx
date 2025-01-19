//
// use client
//
"use client";

import Link from "next/link";
import { Button } from "./button";

//
// Define the parameters
//
interface CustomLinkProps {
    href?: string;
    linkName: string;
    className?: string;
    disabled?: boolean;
}

export default function CustomLink({
    href = "#",
    linkName,
    className,
    disabled,
}: CustomLinkProps) {
    return (
        <Button disabled={disabled} variant={"outline"}>
            <Link href={href} className={className}>{linkName}</Link>
        </Button>
    )
}