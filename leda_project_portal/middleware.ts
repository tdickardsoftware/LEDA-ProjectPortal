/* eslint-disable react-hooks/rules-of-hooks */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from "better-auth/cookies"; // Correct import

export async function middleware(request: NextRequest) {
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' ||
        process.env.MAINTENANCE_MODE === 'true';

    console.log('Middleware running, maintenance mode:', isMaintenanceMode);

    const pathname = request.nextUrl.pathname;

    const publicPaths = [
        '/',
        '/login',
        '/sign-up',
        '/login/forgot-password',
        '/login/reset-password',
        '/maintenance'
    ];

    if (isMaintenanceMode && pathname !== '/maintenance') {
        console.log('Redirecting to maintenance page from:', pathname);
        return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    const sessionCookie = getSessionCookie(request); // Use getSessionCookie for optimistic check

    if (sessionCookie) {
        if (publicPaths.includes(pathname)) {
            return NextResponse.redirect(new URL('/Portal', request.url));
        }
        return NextResponse.next();
    }

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    const loginUrl = new URL('/login', request.url);
    const returnTo = pathname + (request.nextUrl.search || '');
    loginUrl.searchParams.set('redirectTo', returnTo);
    console.log('Unauthenticated user, redirecting to login from:', pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: [
        '/((?!api|_next|_static|_vercel|favicon.ico).*)'
    ]
}
