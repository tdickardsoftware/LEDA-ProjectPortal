/**
 * Help wiki — renders the markdown files in /content/help (one per portal section).
 * To edit documentation, edit those files; each `## Heading` is a page entry in the
 * table of contents.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { HelpMarkdown } from "@/components/help-markdown";

export const metadata: Metadata = { title: "Help" };

const SECTIONS = ["management", "maintenance", "reports", "activities"];

const slug = (t: string) =>
	t.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s/g, "-");

export default function HelpPage() {
	const docs = SECTIONS.map((name) =>
		readFileSync(join(process.cwd(), "content", "help", `${name}.md`), "utf8")
	);
	const toc = docs.map((md) => ({
		section: md.match(/^# (.+)$/m)?.[1] ?? "",
		pages: [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]),
	}));

	return (
		<div className="mx-auto flex max-w-6xl gap-8 p-6">
			<nav className="sticky top-6 hidden h-fit w-56 shrink-0 text-sm md:block">
				<h2 className="mb-2 text-lg font-semibold">LEDA Portal Help</h2>
				{toc.map(({ section, pages }) => (
					<div key={section} className="mb-3">
						<a href={`#${slug(section)}`} className="font-medium hover:underline">
							{section}
						</a>
						<ul className="ml-3 mt-1 space-y-1 text-muted-foreground">
							{pages.map((p) => (
								<li key={p}>
									<a href={`#${slug(p)}`} className="hover:underline">
										{p}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>
			<main className="min-w-0 flex-1">
				<HelpMarkdown source={docs.join("\n\n")} />
			</main>
		</div>
	);
}
