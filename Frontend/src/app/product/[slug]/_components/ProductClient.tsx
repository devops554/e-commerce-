"use client";

import { productService, Product, ProductVariant } from '@/services/product.service'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useSocket } from '@/hooks/useSocket'
import { toast } from 'sonner'
import Link from 'next/link'

import { ProductImageGallery } from '@/components/product/detail/ProductImageGallery'
import { ProductInfo } from '@/components/product/detail/ProductInfo'
import { ProductPricing } from '@/components/product/detail/ProductPricing'
import { ProductVariantSelector } from '@/components/product/detail/ProductVariantSelector'
import { ProductDescription } from '@/components/product/detail/ProductDescription'
import { ProductSpecifications } from '@/components/product/detail/ProductSpecifications'
import { ProductHighlights } from '@/components/product/detail/ProductHighlights'
import { ProductManufacturer } from '@/components/product/detail/ProductManufacturer'
import { ProductCard } from '@/components/product/ProductCard'
import OffersSection from '@/components/product/detail/OffersSection'
import ProductFaqs from '@/components/product/detail/ProductFaqs'
import ProductReviews from '@/components/product/detail/ProductReviews'
import { useReviews } from '@/hooks/useReviews'

type FullProduct = Product & { variants: ProductVariant[] }

export default function ProductPage() {
    const { slug } = useParams()
    const { addToCart } = useCart()

    const [product, setProduct] = useState<FullProduct | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
    const [selectedImage, setSelectedImage] = useState<string>('')
    const [similarProducts, setSimilarProducts] = useState<any[]>([])
    const [recentProducts, setRecentProducts] = useState<any[]>([])
    const [reviewPage, setReviewPage] = useState(1)

    // ── useReviews must be here, unconditionally, before any early return.
    // The hook's own `enabled` flag handles the no-product case internally.
    const { data: reviewsData } = useReviews({
        productId: product?._id,
        status: 'APPROVED',
        page: reviewPage,
        limit: 10,
    })

    useEffect(() => {
        const recent = JSON.parse(localStorage.getItem('recent_products') || '[]')
        setRecentProducts(recent)
    }, [])

    useSocket('stock.updated', (data) => {
        if (!product || data.productId !== product._id) return
        setProduct(prev => {
            if (!prev) return prev
            const newVariants = prev.variants.map(v =>
                v._id === data.variantId ? { ...v, stock: data.stock } : v
            )
            return { ...prev, variants: newVariants }
        })
        setSelectedVariant(prev => {
            if (!prev || prev._id !== data.variantId) return prev
            return { ...prev, stock: data.stock }
        })
    })

    useEffect(() => {
        if (!slug) return
        const fetch = async () => {
            try {
                const data = await productService.getOne(slug as string)
                setProduct(data)
                const firstVariant = data.variants?.[0] ?? null
                setSelectedVariant(firstVariant)
                setSelectedImage(firstVariant?.images?.[0]?.url || data.thumbnail?.url || '')

                const recent = JSON.parse(localStorage.getItem('recent_products') || '[]')
                const newRecent = [
                    {
                        id: data._id,
                        slug: data.slug,
                        title: data.title,
                        image: data.thumbnail?.url,
                        price: firstVariant?.price || 0,
                        discountPrice: firstVariant?.discountPrice || 0,
                        attributes: firstVariant?.attributes || [],
                        stock: firstVariant?.stock || 0,
                    },
                    ...recent.filter((p: any) => p.slug !== data.slug),
                ].slice(0, 6)
                localStorage.setItem('recent_products', JSON.stringify(newRecent))
                setRecentProducts(newRecent)

                if (data.category) {
                    const categoryId = typeof data.category === 'string'
                        ? data.category
                        : (data.category as any)._id
                    const similar = await productService.getAll({ category: categoryId, limit: 6 })
                    setSimilarProducts(similar.products.filter((p: any) => p.slug !== slug))
                }
            } catch (err) {
                console.error(err)
                toast.error('Failed to load product')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [slug])

    const allImages = useMemo(() => {
        if (!product) return []
        const imgs: { url: string }[] = []
        if (product.thumbnail?.url) imgs.push({ url: product.thumbnail.url })
        product.images?.forEach((i: any) => {
            if (!imgs.find(x => x.url === i.url)) imgs.push({ url: i.url })
        })
        product.variants?.forEach(v =>
            v.images?.forEach(i => {
                if (!imgs.find(x => x.url === i.url)) imgs.push({ url: i.url })
            })
        )
        return imgs
    }, [product])

    const handleSelectVariant = (v: ProductVariant) => {
        setSelectedVariant(v)
        if (v.images?.[0]?.url) setSelectedImage(v.images[0].url)
    }

    const handleAddToCart = () => {
        if (!product || !selectedVariant) return
        const effectivePrice =
            selectedVariant.discountPrice > 0
                ? selectedVariant.discountPrice
                : selectedVariant.price
        addToCart({
            id: selectedVariant._id,
            productId: product._id,
            variantId: selectedVariant._id,
            title: product.title,
            price: effectivePrice,
            quantity: 1,
            image: selectedImage,
            gstRate: product.gst?.gstRate,
            hsnCode: product.gst?.hsnCode,
        })
        toast.success(`${product.title} added to cart!`)
    }

    // Derived values — safe after all hooks
    const categoryName = product
        ? typeof product.category === 'string' ? '' : (product.category as any)?.name
        : ''

    const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false

    // ── Conditional early returns come LAST, after every hook ──
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center">
            Product not found
        </div>
    )

    return (
        <main className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                {categoryName && (
                    <>
                        <span className="hover:text-primary cursor-pointer">{categoryName}</span>
                        <ChevronRight className="h-3 w-3" />
                    </>
                )}
                <span className="text-slate-700 truncate max-w-[200px]">{product.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* LEFT — sticky gallery */}
                <div className="lg:sticky lg:top-24">
                    <ProductImageGallery
                        selectedImage={selectedImage}
                        allImages={allImages}
                        productTitle={product.title}
                        onImageSelect={setSelectedImage}
                        onAddToCart={handleAddToCart}
                        disabled={isOutOfStock}
                    />
                </div>

                {/* RIGHT — scrollable details */}
                <div className="flex flex-col gap-6">

                    <section className="bg-white p-6 md:p-8 border border-slate-200 rounded-[32px] shadow-sm space-y-6">
                        <ProductInfo
                            title={product.title}
                            brand={product.brand}
                            ratingsAverage={product.ratingsAverage}
                            ratingsCount={product.ratingsCount}
                            isNewArrival={product.isNewArrival}
                            categoryName={categoryName}
                            tags={product.tags}
                            attributes={selectedVariant?.attributes || product.attributes}
                        />
                        <ProductPricing variant={selectedVariant} />
                        <ProductVariantSelector
                            variants={product.variants || []}
                            selectedVariant={selectedVariant}
                            onSelect={handleSelectVariant}
                        />
                        <OffersSection returnPolicy={product.returnPolicy} />
                    </section>

                    <section className="space-y-6">
                        <ProductHighlights highLight={product.highLight} />
                        <ProductSpecifications
                            specifications={product.specifications}
                            attributes={product.attributes}
                        />
                        <ProductDescription
                            shortDescription={product.shortDescription}
                            description={product.description}
                        />
                        <ProductManufacturer
                            manufacturerInfo={product.manufacturerInfo}
                            warranty={product.warranty}
                            disclaimer={product.disclaimer}
                            customerCareDetails={product.customerCareDetails}
                        />
                    </section>
                </div>
            </div>

            {/* Recommendations */}
            <div className="mt-20 space-y-16">
                {similarProducts.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Similar Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {similarProducts.map((p: any) => {
                                const fv = p.variants?.[0]
                                return (
                                    <ProductCard
                                        key={p._id}
                                        id={fv?._id || p._id}
                                        productId={p._id}
                                        variantId={fv?._id || p._id}
                                        slug={p.slug}
                                        title={p.title}
                                        brand={p.brand || ''}
                                        price={fv?.price || 0}
                                        discountPrice={fv?.discountPrice || 0}
                                        attributes={fv?.attributes}
                                        stock={fv?.stock}
                                        image={p.thumbnail?.url || ''}
                                    />
                                )
                            })}
                        </div>
                    </section>
                )}

                {recentProducts.filter(p => p.slug !== slug).length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Recently Viewed</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {recentProducts.filter(p => p.slug !== slug).map((p: any) => (
                                <ProductCard
                                    key={p.id}
                                    id={p.id}
                                    productId={p.productId || p.id}
                                    variantId={p.variantId || p.id}
                                    slug={p.slug}
                                    title={p.title}
                                    brand={p.brand || ''}
                                    price={p.price || 0}
                                    discountPrice={p.discountPrice || 0}
                                    attributes={p.attributes}
                                    stock={p.stock}
                                    image={p.image || ''}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <ProductFaqs faqs={product.faqs} />

            <ProductReviews
                reviews={reviewsData?.data || []}
                averageRating={product.ratingsAverage || 0}
                totalReviews={product.ratingsCount || 0}
                currentPage={reviewPage}
                totalPages={reviewsData?.totalPages || 0}
                totalItems={reviewsData?.total || 0}
                onPageChange={setReviewPage}
            />
        </main>
    )
}