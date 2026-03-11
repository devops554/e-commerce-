import type { Metadata } from "next";
import { buildMetadata } from "./base";

/**
 * Dynamic metadata for /search?q=<query> pages.
 *
 * Usage in app/search/page.tsx:
 *   export async function generateMetadata({ searchParams }): Promise<Metadata> {
 *     return searchPageMetadata(searchParams.q);
 *   }
 */
export function searchPageMetadata(query?: string): Metadata {
    if (!query) {
        return buildMetadata({
            title: "Search Groceries | Kiranase",
            description:
                "Search from 7000+ grocery products on Kiranase. Find fresh vegetables, fruits, dairy, snacks, and daily essentials. Delivered in 30 minutes.",
            keywords: "search groceries, find products, Kiranase search, grocery search India",
            path: "/search",
            noIndex: true, // Empty search page shouldn't be indexed
        });
    }

    const displayQuery = decodeURIComponent(query);

    return buildMetadata({
        title: `${displayQuery} - Search Results | Kiranase`,
        description: `Search results for "${displayQuery}" on Kiranase. Find the best prices on ${displayQuery} and get it delivered in 30 minutes.`,
        keywords: `${displayQuery}, buy ${displayQuery} online, ${displayQuery} price, Kiranase`,
        path: `/search?q=${query}`,
        noIndex: true, // Search result pages are typically noindexed
    });
}