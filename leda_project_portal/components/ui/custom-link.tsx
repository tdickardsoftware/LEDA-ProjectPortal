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
    parentPage: string;
}

export default function CustomLink({
    href = "#",
    linkName,
    className,
    disabled,
    parentPage
}: CustomLinkProps) {
    href = href.replace("**REPLACE**", parentPage);
    return (
        <Button disabled={disabled} variant={"outline"}>
            <Link href={href} className={className} prefetch={true}>{linkName}</Link>
        </Button>
    )
}