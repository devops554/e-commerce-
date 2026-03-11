import type { Metadata } from "next";
import { buildMetadata } from "./base";

/** Static metadata for the top-level /categories listing page */
export const categoriesMetadata: Metadata = buildMetadata({
    title: "Shop by Category | Kiranase",
    description:
        "Browse 20+ grocery categories on Kiranase — fresh vegetables, fruits, dairy, snacks, beverages, personal care, household essentials & more. Delivered in 30 minutes.",
    keywords:
        "grocery categories, vegetables, fruits, dairy, snacks, beverages, personal care, household, baby care, pet food, organic, staples, Kiranase",
    path: "/categories",
});

/**
 * Dynamic metadata for individual category pages.
 * Usage: export const generateMetadata = ({ params }) => categoryPageMetadata(params.slug, params.displayName)
 */
export function categoryPageMetadata(
    slug: string,
    displayName: string
): Metadata {
    return buildMetadata({
        title: `Buy ${displayName} Online | Kiranase`,
        description: `Shop fresh ${displayName.toLowerCase()} online at the best prices on Kiranase. Wide range of ${displayName.toLowerCase()} products delivered to your doorstep in 30 minutes.`,
        keywords: `buy ${displayName.toLowerCase()} online, ${displayName.toLowerCase()} delivery, fresh ${displayName.toLowerCase()}, Kiranase ${displayName.toLowerCase()}`,
        path: `/categories/${slug}`,
    });
}