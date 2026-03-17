import type { MetadataRoute } from "next";

const districts = [
  'patna', 'muzaffarpur', 'gaya', 'bhagalpur', 'darbhanga',
  'purnia', 'araria', 'begusarai', 'madhubani', 'samastipur',
  'sitamarhi', 'siwan', 'gopalganj', 'saran', 'vaishali',
  'nalanda', 'nawada', 'aurangabad', 'rohtas', 'buxar',
  'kaimur', 'bhojpur', 'motihari', 'bettiah', 'madhepura',
  'saharsa', 'supaul', 'khagaria', 'katihar', 'kishanganj',
  'munger', 'lakhisarai', 'sheikhpura', 'jamui', 'banka',
  'jehanabad', 'arwal', 'sheohar',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = "https://www.kiranase.com";

  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/partner-with-us`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
  ];

  const districtPages = districts.map((district) => ({
    url: `${BASE_URL}/grocery-delivery/${district}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...districtPages];
}

