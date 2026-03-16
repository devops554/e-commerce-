"use client";
import React from 'react'
import { useRouter } from 'next/navigation'
import { CategorySidebar } from '@/components/category/CategorySidebar'
import { CategoryFilterBar } from '@/components/category/CategoryFilterBar'
import { useProductType } from '@/hooks/useProductTypes'
import { useProducts } from '@/hooks/useProducts'
import { useDebounce } from '@/hooks/useDebounce'
import { ProductCard } from '@/components/product/ProductCard'
import { Loader2, ChevronLeft, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

interface Props {
    slug: string
    initialProductType?: any
    initialProducts?: any[]
}

export default function ProductTypeClient({
    slug,
    initialProductType,
    initialProducts = [],
}: Props) {
    const router = useRouter()

    const [search, setSearch] = React.useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [selectedBrands, setSelectedBrands] = React.useState<string[]>([])
    const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 100000])

    const { data: productType, isLoading: loadingType } = useProductType(slug)

    const { data: productsData, isLoading: loadingProducts } = useProducts({
        productType: productType?._id,
        isActive: true,
        limit: 50,
        search: debouncedSearch || undefined,
        brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
        minPrice: priceRange[0] || undefined,
        maxPrice: priceRange[1] || undefined,
    }, !!productType?._id)

    const products = productsData?.products || []

    const availableBrands = React.useMemo(() => {
        const brands = Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean)))
        return brands.map(name => ({ name }))
    }, [products])

    if (loadingType) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </main>
        )
    }

    if (!productType) {
        return (
            <main className="min-h-screen bg-white">
                <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Product Type Not Found</h2>
                    <p className="text-slate-500 mb-8 font-medium">The page you're looking for might have been moved or deleted.</p>
                    <Button onClick={() => router.push('/')} className="rounded-2xl h-12 px-8 font-bold">Go Home</Button>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* ── Sidebar ── */}
                    <div className="hidden lg:block lg:w-64 shrink-0">
                        <CategorySidebar productType={productType._id} />
                    </div>

                    {/* ── Main content ── */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* Header row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost" size="sm"
                                    className="lg:hidden h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                                    onClick={() => router.back()}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tight">
                                    {productType.name}
                                </h1>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                {/* Mobile sidebar trigger */}
                                <div className="lg:hidden">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" size="icon"
                                                className="shrink-0 rounded-xl h-10 w-10 border-slate-200">
                                                <Menu className="h-5 w-5 text-slate-600" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left"
                                            className="w-[300px] sm:w-[350px] p-0 border-none bg-slate-50">
                                            <CategorySidebar productType={productType._id} />
                                        </SheetContent>
                                    </Sheet>
                                </div>

                                {/* Search */}
                                <div className="relative w-full md:w-72 lg:w-96">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder={`Search in ${productType.name}...`}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 h-10 lg:h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter bar */}
                        <CategoryFilterBar
                            search={search}
                            setSearch={setSearch}
                            selectedBrands={selectedBrands}
                            setSelectedBrands={setSelectedBrands}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            availableBrands={availableBrands}
                        />

                        {productType.description && !search && selectedBrands.length === 0 && (
                            <p className="text-slate-500 font-medium max-w-3xl leading-relaxed">
                                {productType.description}
                            </p>
                        )}

                        {/* ── Product grid ──
                         *
                         * KEY FIX: use a fixed-column auto-fill grid so every
                         * cell is exactly the same width.
                         *
                         * grid-cols sets a fixed number of equal columns.
                         * justify-items-stretch (default) makes each cell fill
                         * its column — cards are all the same width.
                         *
                         * Previously `justify-items-center` was used, which lets
                         * items shrink to their intrinsic width and causes uneven
                         * card sizes when content differs.
                         */}
                        {loadingProducts ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="animate-pulse bg-slate-100 rounded-2xl aspect-[3/4]" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                                {products.map((product: any) => {
                                    const fv = product.variants?.[0]
                                    return (
                                        <ProductCard
                                            key={product._id}
                                            id={fv?._id || product._id}
                                            productId={product._id}
                                            variantId={fv?._id || product._id}
                                            slug={product.slug}
                                            title={product.title}
                                            brand={product.brand}
                                            price={fv?.price || 0}
                                            discountPrice={fv?.discountPrice || 0}
                                            attributes={fv?.attributes}
                                            stock={fv?.stock}
                                            image={product.thumbnail?.url || ''}
                                        />
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                                    <Search className="h-10 w-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
                                <p className="text-slate-500 font-medium">
                                    We couldn't find any products in this section at the moment.
                                </p>
                                {(search || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000) && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('')
                                            setSelectedBrands([])
                                            setPriceRange([0, 100000])
                                        }}
                                        className="rounded-xl font-bold"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}