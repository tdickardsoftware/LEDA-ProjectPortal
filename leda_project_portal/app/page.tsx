import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Home | LEDA Portal",
};

export default function Page() {
	return (
		<main>
			<p>Home Page</p>
			<Link href="/Portal" className="text-blue-400">
				Go to Portal -{">"}
			</Link>
		</main>
	);
}
