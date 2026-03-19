import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/product(.*)',
    '/api/webhooks(.*)',
    '/product-type(.*)',
    '/category(.*)',
    '/search(.*)',
    '/partner-with-us(.*)',
    '/seller/signup',
    '/seller/login',
    '/delivery/signup',
    '/delivery/login',
      '/robots.txt',
    '/sitemap.xml',
    '/grocery-delivery(.*)',
    '/privacy-policy',
    '/about-us',
    '/terms-of-use',
    '/faq',
    '/blog(.*)',
];

export function middleware(request: NextRequest) {
    const { nextUrl } = request;

    // ✅ 'accessToken' — AuthContext se match karta hai
    const token = request.cookies.get('accessToken')?.value;

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

    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (token && (nextUrl.pathname === '/auth/login' || nextUrl.pathname === '/auth/register')) {
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
