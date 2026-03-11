import type { Metadata } from "next";
import { categoryPageMetadata } from "@/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const displayName = slug.replace(/-/g, " ");
  return categoryPageMetadata(slug, displayName);
}

export { default } from "./_components/CategoryClient";
