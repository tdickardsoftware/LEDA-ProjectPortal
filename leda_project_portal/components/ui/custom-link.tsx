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
	onClick?: () => void;
}

export default function CustomLink({
    href = "#",
    linkName,
    className,
    disabled,
    parentPage,
	onClick
}: CustomLinkProps) {
    href = href.replace("**REPLACE**", parentPage);
    return (
        <Button disabled={disabled} variant={"outline"} className="hover:bg-muted border-border text-foreground">
			<Link href={href} className={className} prefetch={true} onClick={onClick}>{linkName}</Link>
        </Button>
    )
}