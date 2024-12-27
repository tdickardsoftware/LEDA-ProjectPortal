import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Management"
}

export default async function Page() {
    return (
        <>
            <div className="container mx-auto py-10">
                <p>Management Page</p>
            </div>
        </>
    );
}