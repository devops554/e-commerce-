import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const BASE_URL = "https://www.kiranase.com";

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/search`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/partner-with-us`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/auth/login`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/auth/register`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.4,
        },
    ];
}
