import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/grocery-delivery/"],
                disallow: [
                    "/admin/",
                    "/manager/",
                    "/(protected)/",
                    "/checkout",
                    "/my-orders",
                    "/profile",
                    "/seller/onboarding",
                    "/api/",
                ],
            },
        ],
        sitemap: "https://www.kiranase.com/sitemap.xml",
        host: "https://www.kiranase.com",
    };
}
