import type { Metadata } from "next";

export const BASE_URL = "https://www.kiranase.com";

export const DEFAULT_OG_IMAGE = {
    url: "https://res.cloudinary.com/dxyopn9v0/image/upload/v1773670968/Kiranase_logo_Main_yugjoz.jpg",
    width: 1200,
    height: 630,
    alt: "Kiranase - Bazaar se Sasta Har Din | 30 Min Delivery",
};

export const baseMeta = {
    authors: [{ name: "Kiranase" }],
    creator: "Kiranase",
    publisher: "Kiranase",
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png" },
        ],
        other: [
            { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
    },
    manifest: "/site.webmanifest",
    other: {
        "theme-color": "#16a34a",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
} satisfies Partial<Metadata>;

export function buildMetadata({
    title,
    description,
    keywords,
    path = "/",
    ogImage = DEFAULT_OG_IMAGE,
    noIndex = false,
}: {
    title: string;
    description: string;
    keywords: string;
    path?: string;
    ogImage?: typeof DEFAULT_OG_IMAGE;
    noIndex?: boolean;
}): Metadata {
    const url = `${BASE_URL}${path}`;
    return {
        ...baseMeta,
        title,
        description,
        keywords,
        metadataBase: new URL(BASE_URL),
        ...(noIndex && { robots: { index: false, follow: true } }),
        openGraph: {
            title,
            description,
            url,
            siteName: "Kiranase",
            images: [ogImage],
            locale: "en_IN",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage.url],
            creator: "@kiranase",
        },
    };
}
