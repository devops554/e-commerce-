import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const publicRoutes = ['/', '/login', '/register', '/product(.*)', '/api/webhooks(.*)', '/product-type(.*)', '/search(.*)'];

export function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const token = request.cookies.get('token')?.value;

    const isPublicRoute = publicRoutes.some((route) => {
        const regex = new RegExp(`^${route.replace('(.*)', '.*')}$`);
        return regex.test(nextUrl.pathname);
    });

    let role = null;

    if (token) {
        try {
            const decoded: any = jwt.decode(token);
            role = decoded?.role;
        } catch (err) {
            console.log('Invalid token');
        }
    }

    // 🔐 Not logged in → redirect to login
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 🔁 Already logged in & going to login/register
    if (token && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {

        if (role === 'ADMIN' || role === 'SUBADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};