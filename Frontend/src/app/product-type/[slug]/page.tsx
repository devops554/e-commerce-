import type { Metadata } from "next";
import { buildMetadata } from "@/seo";
import ProductTypeClient from "./_components/ProductTypeClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const displaySlug = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return buildMetadata({
    title: `${displaySlug} | Kiranase`,
    description: `Shop all ${displaySlug} products on Kiranase. Best prices, delivered in 30 minutes.`,
    keywords: `${displaySlug}, buy ${displaySlug} online, Kiranase`,
    path: `/product-type/${slug}`,
  });
}

export default async function ProductTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let initialProductType = null;
  let initialProducts: any[] = [];

  try {
    // ✅ productTypeService directly call karo — same function jo hook use karta hai
    const BASE = process.env.NEXT_PUBLIC_API_URL;

    const [ptRes,] = await Promise.all([
      fetch(`${BASE}/product-types/${slug}`, {
        next: { revalidate: 60 }
      })
    ]);

    if (ptRes.ok) {
      const ptData = await ptRes.json();
      initialProductType = ptData?.data ?? ptData ?? null;

      if (initialProductType?._id) {
        const pRes = await fetch(
          `${BASE}/products?productType=${initialProductType._id}&isActive=true&limit=50`,
          { next: { revalidate: 60 } }
        );
        if (pRes.ok) {
          const pData = await pRes.json();
          initialProducts = pData?.products ?? [];
        }
      }
    }
  } catch (e) {
    console.error("SSR fetch failed:", e);
    // ✅ Fail silently — client-side fetch fallback karega
  }

  return (
    <ProductTypeClient
      slug={slug}
      initialProductType={initialProductType}
      initialProducts={initialProducts}
    />
  );
}