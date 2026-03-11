import type { Metadata } from "next";
import { searchPageMetadata } from "@/seo";
import { Suspense } from "react";
import { SearchResults } from "./SearchResults";
import { DynamicBanner } from "@/components/banner/Banners";
import { BANNER_TYPE } from "@/services/banner.service";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return searchPageMetadata(q);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-[#FF3269]/20 border-t-[#FF3269] animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading search...</p>
        </div>
      </div>
    }>
      <DynamicBanner type={BANNER_TYPE.SEARCH_PAGE} />
      <SearchResults query={q} /> {/* ✅ query prop pass */}
    </Suspense>
  );
}