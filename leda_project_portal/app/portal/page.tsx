import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Portal"
}

export default function Page() {
    return (
        <main>
            <h1 className="text-4xl font-bold antialiased">Portal Page</h1>
        </main>
    );
}