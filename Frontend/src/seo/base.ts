import type { Metadata } from "next";

export const BASE_URL = "https://www.kiranase.com";

export const DEFAULT_OG_IMAGE = {
    url: "/photo/Kiranase-logo.png",
    width: 512,   // ← logo ka actual size daalo
    height: 512,  // ← actual size
    alt: "Kiranase - Fresh Groceries Delivered in 30 Minutes",
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
        "theme-color": "#ffffff",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
} satisfies Partial<Metadata>;

/**
 * Helper to build full page metadata, merging with base defaults.
 */
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