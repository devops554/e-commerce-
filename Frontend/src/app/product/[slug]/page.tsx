import type { Metadata } from "next";
import { productPageMetadata } from "@/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return productPageMetadata({
    name: slug.replace(/-/g, " "),
    slug,
    description: "",
    category: "",
    brand: "",
    thumbnail: "",
  });
}

export { default } from "./_components/ProductClient";
