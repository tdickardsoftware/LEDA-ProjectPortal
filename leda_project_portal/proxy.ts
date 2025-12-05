/* eslint-disable react-hooks/rules-of-hooks */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from "better-auth/cookies"; // Correct import

export async function proxy(request: NextRequest) {
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
        '/login/change-required',
        '/maintenance'
    ];

    if (isMaintenanceMode && pathname !== '/maintenance') {
        console.log('Redirecting to maintenance page from:', pathname);
        return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    const sessionCookie = getSessionCookie(request); // Use getSessionCookie for optimistic check

    // Prepare a default pass-through response so we can set cookies
    let response: NextResponse | null = null;

    if (sessionCookie) {
        const mustResetCookie = request.cookies.get('mustResetPassword')?.value === '1';
        // If authenticated and visiting auth pages, redirect appropriately
        if (pathname === '/login' || pathname === '/sign-up') {
            return NextResponse.redirect(new URL(mustResetCookie ? '/login/change-required' : '/Portal', request.url));
        }
        // If user must reset, force them onto the required page unless already there or on reset/forgot
        const allowWhileMustReset = new Set<string>([
            '/login/change-required',
            '/login/reset-password',
            '/login/forgot-password',
            '/',
        ]);
        if (mustResetCookie && !allowWhileMustReset.has(pathname)) {
            return NextResponse.redirect(new URL('/login/change-required', request.url));
        }
        response = NextResponse.next();
    } else if (pathname === '/sign-up') {
        // If sign-up is disabled, only allow access when both token and email are provided
        const signUpDisabled = process.env.DISABLE_SIGN_UP === 'true';
        if (signUpDisabled) {
            const token = request.nextUrl.searchParams.get('token');
            const email = request.nextUrl.searchParams.get('email');
            if (!token || !email) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
        response = NextResponse.next();
    } else if (publicPaths.includes(pathname)) {
        response = NextResponse.next();
    } else {
        const loginUrl = new URL('/login', request.url);
        const returnTo = pathname + (request.nextUrl.search || '');
        loginUrl.searchParams.set('redirectTo', returnTo);
        console.log('Unauthenticated user, redirecting to login from:', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Double-submit CSRF cookie: set if missing (non-API paths only; matcher excludes /api)
    try {
        const hasCsrf = request.cookies.get('csrfToken');
        if (!hasCsrf) {
            const token = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g, '');
            const isSecure = request.nextUrl.protocol === 'https:';
            response.cookies.set('csrfToken', token, {
                path: '/',
                sameSite: 'lax',
                secure: isSecure,
                httpOnly: false,
                maxAge: 60 * 60 * 24, // 1 day
            });
        }
    } catch {
        // no-op: if crypto not available, token generation falls back above
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next|_static|_vercel|favicon.ico).*)'
    ]
}
