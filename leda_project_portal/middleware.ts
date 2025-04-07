import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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
        // Simplify the matcher to ensure it catches all relevant routes
        '/((?!api|_next|maintenance|_vercel|favicon.ico).*)'
    ]
}