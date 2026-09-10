/**
 * CustomLink component
 *
 * Renders a Next.js Link wrapped in a shadcn outline Button.  The `href` may
 * contain the token `**REPLACE**` which is substituted with `parentPage` at
 * render time, allowing context-aware navigation (e.g. back-links from detail
 * pages to their parent list).
 */
//
// use client
//
"use client";

import Link, { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
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

// Must be rendered inside <Link> to read its pending navigation state
function LinkLabel({ linkName }: { linkName: string }) {
	const { pending } = useLinkStatus();
	return (
		<span className="flex items-center gap-2">
			{pending && <Loader2 className="h-4 w-4 animate-spin" />}
			{linkName}
		</span>
	);
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
			<Link href={href} className={className} onClick={onClick}>
				<LinkLabel linkName={linkName} />
			</Link>
        </Button>
    )
}