"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CategorySidebar } from '@/components/category/CategorySidebar'
import { CategoryFilterBar } from '@/components/category/CategoryFilterBar'
import { useCategory } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
import { useDebounce } from '@/hooks/useDebounce'
import { ProductCard } from '@/components/product/ProductCard'
import { Loader2, ChevronLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryRowSkeleton } from '@/components/product/CategoryRowSkeleton'

export default function CategoryPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    // Filter States
    const [search, setSearch] = React.useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [selectedBrands, setSelectedBrands] = React.useState<string[]>([])
    const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 100000])

    // 1. Fetch current category details
    const { data: category, isLoading: loadingCategory } = useCategory(slug)

    // 2. Fetch products for this category
    const { data: productsData, isLoading: loadingProducts } = useProducts({
        category: category?._id,
        isActive: true,
        limit: 50,
        search: debouncedSearch || undefined,
        brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
        minPrice: priceRange[0] || undefined,
        maxPrice: priceRange[1] || undefined,
    }, !!category?._id)

    const products = productsData?.products || []

    // Extract unique brands for filtering (naive)
    const availableBrands = React.useMemo(() => {
        const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)))
        return brands.map(name => ({ name }))
    }, [products])

    if (loadingCategory) {
        return (
            <main className="min-h-screen bg-white">

                <div className="container mx-auto px-4 lg:px-8 py-12 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </main>
        )
    }

    if (!category) {
        return (
            <main className="min-h-screen bg-white">

                <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Category Not Found</h2>
                    <p className="text-slate-500 mb-8 font-medium">The category you're looking for might have been moved or deleted.</p>
                    <Button onClick={() => router.push('/')} className="rounded-2xl h-12 px-8 font-bold">
                        Go Home
                    </Button>
                </div>

            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#FFFFFF] flex flex-col">


            <div className="flex-1 container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Sidebar - Hidden on mobile, or could be a drawer but here we use list for now */}
                    <div className="hidden lg:block lg:w-72 shrink-0">
                        <CategorySidebar productType={category?.productType?._id as string} />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="lg:hidden h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                                        onClick={() => router.back()}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">
                                        {category.name}
                                    </h1>
                                </div>

                                {/* Product Search Bar */}
                                {/* <div className="relative w-full md:w-72 lg:w-96">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search products in this category..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 h-10 lg:h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-none font-medium"
                                    />
                                </div> */}
                            </div>

                            {/* Advanced Filter Bar */}
                            <CategoryFilterBar
                                search={search}
                                setSearch={setSearch}
                                selectedBrands={selectedBrands}
                                setSelectedBrands={setSelectedBrands}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                availableBrands={availableBrands}
                            />

                            {category.description && !search && selectedBrands.length === 0 && (
                                <p className="text-slate-500 font-medium max-w-3xl leading-relaxed">
                                    {category.description}
                                </p>
                            )}
                        </div>

                        {/* Product Grid */}
                        {loadingProducts ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4 md:gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={i} className="animate-pulse bg-slate-50 rounded-3xl h-64 w-full" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4 md:gap-8 justify-items-center">
                                {products.map((product: any) => {
                                    const firstVariant = product.variants?.[0]
                                    const price = firstVariant?.price || 0
                                    const discountPrice = firstVariant?.discountPrice || 0

                                    return (
                                        <ProductCard
                                            key={product._id}
                                            id={firstVariant?._id || product._id}
                                            productId={product._id}
                                            variantId={firstVariant?._id || product._id}
                                            slug={product.slug}
                                            title={product.title}
                                            brand={product.brand}
                                            price={price}
                                            discountPrice={discountPrice}
                                            attributes={firstVariant?.attributes}
                                            stock={firstVariant?.stock}
                                            image={product.thumbnail?.url || ''}


                                        />
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                                    <Loader2 className="h-10 w-10 animate-spin" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
                                <p className="text-slate-500 font-medium">We couldn't find any products in this category at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </main>
    )
}
