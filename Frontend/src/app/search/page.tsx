"use client"

import { Suspense } from "react"
import { SearchResults } from "./SearchResults"
import { DynamicBanner } from "@/components/banner/Banners"
import { BANNER_TYPE } from "@/services/banner.service"

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 rounded-full border-4 border-[#FF3269]/20 border-t-[#FF3269] animate-spin" />
                        <p className="text-sm text-slate-400 font-medium">Loading search...</p>
                    </div>
                </div>
            }
        >
            <DynamicBanner type={BANNER_TYPE.SEARCH_PAGE} />
            <SearchResults />
        </Suspense>
    )
}
