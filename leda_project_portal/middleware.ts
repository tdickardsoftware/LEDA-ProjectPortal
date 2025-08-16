/* eslint-disable react-hooks/rules-of-hooks */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // In Next.js middleware, environment variables must be prefixed with NEXT_PUBLIC_
    // to be accessible, so let's check both formats
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' ||
        process.env.MAINTEANCE_MODE === 'true';

    // Log to verify middleware is running (check server console)
    console.log('Middleware running, maintenance mode:', isMaintenanceMode);

    // Always allow Next.js internals / static assets to bypass auth logic here
    // (the matcher also excludes these, but keep a quick guard)
    const pathname = request.nextUrl.pathname;

    // Publicly accessible routes (no session required)
    const publicPaths = [
        '/login',
        '/sign-up',
        '/login/forgot-password',
        '/login/reset-password',
        '/maintenance'
    ];

    // If maintenance mode, redirect everyone to /maintenance
    if (isMaintenanceMode && pathname !== '/maintenance') {
        console.log('Redirecting to maintenance page from:', pathname);
        return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // Debug: log raw Cookie header so we can see what the middleware actually receives
    const rawCookieHeader = request.headers.get('cookie') || '';

    // Parse cookie helper
    const parseCookie = (header: string, name: string): string | null => {
        if (!header) return null;
        const parts = header.split(';').map(p => p.trim());
        const match = parts.find(p => p.startsWith(`${name}=`));
        if (!match) return null;
        return decodeURIComponent(match.substring(name.length + 1));
    };

    // PRIMARY auth: rely on cookie presence/value (no getCookieCache)
    let session: { token: string; source: string } | null = null;
    const token = parseCookie(rawCookieHeader, 'better-auth.session_token');

    if (token) {
        // Treat the cookie as the primary auth indicator
        session = { token, source: 'cookie-primary' };    } else {
        console.log('No better-auth.session_token cookie found; user unauthenticated in middleware.');
    }

    // If user is authenticated
    if (session) {
        // Prevent logged-in users from visiting auth pages (send them to home/dashboard)
        if (publicPaths.includes(pathname)) {
            return NextResponse.redirect(new URL('/Portal', request.url));
        }
        // Allow access to everything else
        return NextResponse.next();
    }

    // User not authenticated
    // Allow access to public auth pages and maintenance
    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    // For any other page, redirect to login and include a return URL
    const loginUrl = new URL('/login', request.url);
    const returnTo = pathname + (request.nextUrl.search || '');
    loginUrl.searchParams.set('redirectTo', returnTo);
    console.log('Unauthenticated user, redirecting to login from:', pathname);
    return NextResponse.redirect(loginUrl);
}

// Match all routes except for Next internals, api and common static files so middleware runs on auth pages
export const config = {
    matcher: [
        '/((?!api|_next|_static|_vercel|favicon.ico).*)'
    ]
}