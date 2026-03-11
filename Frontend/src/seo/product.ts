import type { Metadata } from "next";
import { buildMetadata, BASE_URL } from "./base";

/**
 * Dynamic metadata for individual product pages.
 *
 * Usage in app/products/[slug]/page.tsx:
 *   export async function generateMetadata({ params }): Promise<Metadata> {
 *     const product = await fetchProduct(params.slug);
 *     return productPageMetadata(product);
 *   }
 */
export function productPageMetadata(product: {
    name: string;
    slug: string;
    description?: string;
    category?: string;
    brand?: string;
    thumbnail?: string;
    mrp?: number;
    price?: number;
}): Metadata {
    const title = `Buy ${product.name}${product.brand ? ` by ${product.brand}` : ""} | Kiranase`;
    const description =
        product.description ||
        `Buy ${product.name} online at the best price on Kiranase. Fast 30-minute delivery across India. Free delivery above ₹299.`;

    const keywords = [
        `buy ${product.name.toLowerCase()} online`,
        product.brand?.toLowerCase(),
        product.category?.toLowerCase(),
        "Kiranase",
        "grocery delivery",
        "30 minute delivery",
    ]
        .filter(Boolean)
        .join(", ");

    return {
        ...buildMetadata({
            title,
            description,
            keywords,
            path: `/products/${product.slug}`,
            ogImage: product.thumbnail
                ? {
                    url: product.thumbnail,
                    width: 800,
                    height: 800,
                    alt: product.name,
                }
                : undefined,
        }),
        // Product structured data hint via openGraph type
        openGraph: {
            title,
            description,
            url: `${BASE_URL}/products/${product.slug}`,
            siteName: "Kiranase",
            images: [
                product.thumbnail
                    ? { url: product.thumbnail, width: 800, height: 800, alt: product.name }
                    : { url: "/photo/Kiranase-logo.png", width: 1200, height: 630, alt: product.name },
            ],
            locale: "en_IN",
            type: "website",
        },
    };
}