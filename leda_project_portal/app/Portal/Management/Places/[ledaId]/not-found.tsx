'use client';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <main className="flex h-screen flex-col items-center justify-center gap-2 text-center">
            <div className="flex flex-col items-center justify-center w-[80vw]">
                <FaceFrownIcon className="w-24 text-gray-400" />
                <h2 className="text-xl font-semibold">404 Not Found</h2>
                <p>Could not find the requested player.</p>
                <Button className="hover:bg-gray-100 border-gray-300 text-gray-700" onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </div>
        </main>
    );
}