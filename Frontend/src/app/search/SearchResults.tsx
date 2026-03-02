"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, PackageSearch, ChevronLeft, ChevronRight } from "lucide-react"
import { useSearchProducts } from "@/hooks/useProducts"
import ProductCard from "@/components/product/ProductCard"


const LIMIT = 20

function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-100" />
            <div className="p-3 space-y-2">
                <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded-xl w-full mt-3" />
            </div>
        </div>
    )
}

export function SearchResults() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const q = searchParams.get("q") ?? ""
    const [page, setPage] = useState(() => parseInt(searchParams.get("page") ?? "1", 10))

    const { data, isLoading, isError } = useSearchProducts(
        { search: q, page, limit: LIMIT, sort: "-createdAt" },
        !!q
    )

    const products = data?.products ?? []
    const totalPages = data?.totalPages ?? 0
    const total = data?.total ?? 0

    const goToPage = (p: number) => {
        setPage(p)
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", String(p))
        router.push(`/search?${params.toString()}`)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const getCardProps = (product: any) => {
        // Prefer active variants; fall back to any variant if none are active
        const activeVariants: any[] = (product.variants ?? []).filter((v: any) => v.isActive !== false)
        const firstVariant = activeVariants[0] ?? product.variants?.[0]
        return {
            id: `${product._id}-${firstVariant?._id ?? "nv"}`,
            productId: product._id,
            variantId: firstVariant?._id ?? product._id,
            slug: product.slug ?? product._id,
            title: product.title,
            price: firstVariant?.price ?? 0,
            stock: firstVariant?.stock ?? 0,
            discountPrice: firstVariant?.discountPrice ?? 0,
            image: product.thumbnail?.url ?? product.images?.[0]?.url ?? "/placeholder.png",
            brand: product.brand ?? "",
            weight: firstVariant?.unit?.value
                ? `${firstVariant.unit.value} ${firstVariant.unit.name ?? ""}`.trim()
                : undefined,
            rating: product.rating ?? 0,
            reviewCount: product.reviewCount ?? 0,
        }
    }

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            {/* Sticky search band */}
            {/* <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 lg:px-8 py-3">
                    <SearchBar placeholder="Search products..." inputClassName="h-11 bg-gray-50" />
                </div>
            </div> */}

            <div className="container mx-auto px-4 lg:px-8 py-6">

                {/* Results meta */}
                {q && !isLoading && data && (
                    <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">
                                Results for &ldquo;<span className="text-[#FF3269]">{q}</span>&rdquo;
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {total > 0
                                    ? `${total} product${total !== 1 ? "s" : ""} found`
                                    : "No products found"}
                            </p>
                        </div>
                        {totalPages > 1 && (
                            <p className="text-sm text-slate-400 font-medium">
                                Page {page} of {totalPages}
                            </p>
                        )}
                    </div>
                )}

                {/* Empty query */}
                {!q && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-700 mb-1">What are you looking for?</h2>
                        <p className="text-sm text-slate-400">Type a product name in the search bar above</p>
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error state */}
                {isError && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-sm font-medium text-red-500">
                            Failed to load products. Please try again.
                        </p>
                    </div>
                )}

                {/* Empty results */}
                {!isLoading && !isError && q && products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                            <PackageSearch className="h-8 w-8 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-700 mb-1">No products found</h2>
                        <p className="text-sm text-slate-400 max-w-xs">
                            We couldn&apos;t find anything for &ldquo;{q}&rdquo;. Try a different keyword.
                        </p>
                    </div>
                )}

                {/* Product grid */}
                {!isLoading && products.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                            {products.map((product: any) => (
                                <ProductCard key={product._id} {...getCardProps(product)} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page <= 1}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Prev
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                        .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…")
                                            acc.push(p)
                                            return acc
                                        }, [])
                                        .map((item, idx) =>
                                            item === "…" ? (
                                                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-sm">…</span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    onClick={() => goToPage(item as number)}
                                                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all active:scale-95 ${item === page
                                                        ? "bg-[#FF3269] text-white shadow-md shadow-[#FF3269]/30"
                                                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {item}
                                                </button>
                                            )
                                        )}
                                </div>

                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
