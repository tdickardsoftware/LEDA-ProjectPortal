/* eslint-disable react-hooks/rules-of-hooks */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCookieCache } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
    // if (process.env.DISABLE_AUTH != 'true') {
    //     const session = await getCookieCache(request);

    //     if (!session) {
    //         return NextResponse.redirect(new URL('/login', request.url));
    //     }
    // }
    // In Next.js middleware, environment variables must be prefixed with NEXT_PUBLIC_
    // to be accessible, so let's check both formats
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' || 
                             process.env.MAINTEANCE_MODE   === 'true';
    
    // Log to verify middleware is running (check server console)
    console.log('Middleware running, maintenance mode:', isMaintenanceMode);
    
    if (isMaintenanceMode) {
        console.log('Redirecting to maintenance page from:', request.nextUrl.pathname);
        return NextResponse.redirect(new URL('/maintenance', request.url));
    }
    
    return NextResponse.next();
}

// Match all routes except for specific ones you want to exclude
export const config = {
    matcher: [
        '/((?!api|_next|maintenance|login|_vercel|favicon.ico).*)'
    ]
}