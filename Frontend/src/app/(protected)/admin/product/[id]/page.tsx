"use client"

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProduct } from '@/hooks/useProducts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
    ArrowLeft, Edit, Star, Package, Tag, CheckCircle2,
    XCircle, Truck, Layers, ShieldCheck, BarChart2, ExternalLink, Receipt
} from 'lucide-react'
import Link from 'next/link'
import { VariantSelector } from '@/components/admin/product/VariantSelector'
import { ProductAttributes } from '@/components/admin/product/ProductAttributes'
import ReturnPolicyCard from '@/components/admin/product/Returnpolicycard'
import Image from 'next/image'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import ProductFaqs from '@/components/product/detail/ProductFaqs'
import ProductReviews from '@/components/product/detail/ProductReviews'
import { useReviews } from '@/hooks/useReviews'

function resolveId(val: any): string | null {
    if (!val) return null
    if (typeof val === 'string') return val
    if (typeof val === 'object' && val._id) return String(val._id)
    return String(val)
}

function getPriceDisplay(variant: any) {
    if (!variant) return null
    return {
        price: variant.price,
        discountPrice: variant.discountPrice,
        discount: variant.discount,
    }
}

function SpecRow({ label, value }: { label: string; value: any }) {
    if (!value) return null
    return (
        <div className="flex justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-xs font-semibold text-slate-500 shrink-0">{label}</span>
            <span className="text-xs text-slate-800 text-right font-medium">{String(value)}</span>
        </div>
    )
}

export default function AdminProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const { setBreadcrumbs } = useBreadcrumb()
    const [reviewPage, setReviewPage] = useState(1)

    const { data: product, isLoading, isError } = useProduct(id)

    React.useEffect(() => {
        setBreadcrumbs([
            { label: 'Products', href: '/admin/product' },
            { label: product?.title || 'Product' }
        ])
    }, [product, setBreadcrumbs])

    const allImages = React.useMemo(() => {
        if (!product) return []
        const imgs: { url: string }[] = []
        if (product.thumbnail?.url) imgs.push({ url: product.thumbnail.url })
        if (product.images?.length) product.images.forEach(i => imgs.push({ url: i.url }))
        return imgs
    }, [product])

    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null)
    const [selectedVariant, setSelectedVariant] = useState<any>(null)

    React.useEffect(() => {
        if (product) {
            setActiveImageUrl(product.thumbnail?.url || product.images?.[0]?.url || null)
            if (product.variants?.length) setSelectedVariant(product.variants[0])
        }
    }, [product])

    const { data: reviewsData } = useReviews({
        productId: product?._id,
        status: 'APPROVED',
        page: reviewPage,
        limit: 10,
    })


    const displayImage = activeImageUrl
    const prices = selectedVariant ? getPriceDisplay(selectedVariant) : null

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading product...</p>
            </div>
        </div>
    )

    if (isError || !product) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <XCircle className="h-14 w-14 text-red-300" />
            <p className="text-slate-600 font-semibold">Product not found</p>
            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
    )

    const categoryName = typeof product.category === 'object' ? (product.category as any)?.name : ''
    const subCategoryName = typeof product.subCategory === 'object' ? (product.subCategory as any)?.name : ''
    const variants: any[] = (product as any).variants || []

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">

            {/* ── Header ── */}
            <div className="flex items-center justify-between py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight line-clamp-1">{product.title}</h1>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">/{product.slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={`rounded-full px-3 ${product.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                        {product.isActive ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Link href={`/admin/product/edit/${product.slug}`}>
                        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            <Edit className="h-4 w-4 mr-2" /> Edit Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ── Gallery + Info ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Gallery */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        {displayImage ? (
                            <Image
                                src={displayImage}
                                alt={product.title}
                                fill
                                className="object-cover transition-all duration-500"
                                unoptimized
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-300">
                                <Package className="h-20 w-20" />
                            </div>
                        )}
                        {prices?.discount ? (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                                -{prices.discount}% OFF
                            </div>
                        ) : null}
                    </div>

                    {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveImageUrl(img.url)}
                                    className={`relative shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImageUrl === img.url
                                        ? 'border-blue-500 ring-2 ring-blue-200 scale-95'
                                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                                        }`}
                                >
                                    <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {categoryName && <Badge variant="outline" className="rounded-full text-xs">{categoryName}</Badge>}
                        {subCategoryName && <Badge variant="outline" className="rounded-full text-xs text-purple-600 border-purple-200 bg-purple-50">{subCategoryName}</Badge>}
                        {product.isNewArrival && <Badge className="rounded-full text-xs bg-emerald-100 text-emerald-700 border-emerald-200">New Arrival</Badge>}
                    </div>

                    {/* Price block */}
                    <div className="p-5 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white">
                        {prices ? (
                            <div className="space-y-1">
                                {prices.discount ? (
                                    <>
                                        <p className="text-slate-400 text-sm line-through">₹{prices.price?.toLocaleString('en-IN')}</p>
                                        <p className="text-3xl font-black">₹{prices.discountPrice?.toLocaleString('en-IN')}</p>
                                        <p className="text-green-400 text-xs font-bold">Save ₹{(prices.price - prices.discountPrice)?.toLocaleString('en-IN')} ({prices.discount}% off)</p>
                                    </>
                                ) : (
                                    <p className="text-3xl font-black">₹{prices.price?.toLocaleString('en-IN')}</p>
                                )}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                                    <Package className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-xs text-slate-300">
                                        Stock: <span className={`font-bold ${selectedVariant?.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {selectedVariant?.stock > 0 ? `${selectedVariant.stock} units` : 'Out of Stock'}
                                        </span>
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-xs text-slate-300 font-mono">{selectedVariant?.sku}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">Select a variant to see pricing</p>
                        )}
                    </div>

                    <VariantSelector
                        variants={variants}
                        selectedVariant={selectedVariant}
                        onSelect={(v) => {
                            setSelectedVariant(v)
                            if (v.images?.length > 0) {
                                setActiveImageUrl(v.images[0].url)
                            } else {
                                setActiveImageUrl(product.thumbnail?.url || null)
                            }
                        }}
                    />

                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-700">Short Description</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{product.shortDescription}</p>
                    </div>

                    {(product.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {product.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom sections grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Full Description */}
                <div className="rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-slate-400" /> Full Description
                    </h3>
                    <Separator />
                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</div>
                </div>

                {/* Attributes */}
                <ProductAttributes
                    productAttributes={product.attributes}
                    selectedVariantAttributes={selectedVariant?.attributes}
                    isVariantSelected={!!selectedVariant}
                />

                {/* Specs */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-slate-400" /> Specifications
                        </h3>
                        <Separator />
                        <div>
                            {Object.entries(product.specifications).map(([groupKey, groupVal]) => {
                                if (groupKey === 'custom' && Array.isArray(groupVal)) {
                                    return groupVal.map((item: any, i: number) => (
                                        <SpecRow key={`custom-${i}`} label={item.key} value={item.value} />
                                    ))
                                }
                                if (typeof groupVal === 'object' && !Array.isArray(groupVal)) {
                                    return Object.entries(groupVal).map(([k, v]) => (
                                        <SpecRow key={`${groupKey}-${k}`} label={k} value={v as any} />
                                    ))
                                }
                                return <SpecRow key={groupKey} label={groupKey} value={groupVal} />
                            })}
                        </div>
                    </div>
                )}

                {/* Manufacturer */}
                {product.manufacturerInfo && (
                    <div className="rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-slate-400" /> Manufacturer Info
                        </h3>
                        <Separator />
                        <SpecRow label="Name" value={product.manufacturerInfo.name} />
                        <SpecRow label="Address" value={product.manufacturerInfo.address} />
                        <SpecRow label="Country of Origin" value={product.manufacturerInfo.countryOfOrigin} />
                        <SpecRow label="Shelf Life" value={product.manufacturerInfo.selfLife} />
                    </div>
                )}

                {/* GST */}
                {product.gst && (
                    <div className="rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3 bg-emerald-50/20 border-emerald-100">
                        <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-emerald-600" /> Tax &amp; GST Details
                        </h3>
                        <Separator className="bg-emerald-100/50" />
                        <SpecRow label="HSN / SAC Code" value={product.gst.hsnCode} />
                        <SpecRow label="GST Rate" value={`${product.gst.gstRate}%`} />
                        <SpecRow label="Tax Status" value={product.gst.includedInPrice ? 'Inclusive (GST included in price)' : 'Exclusive (GST added on top)'} />
                    </div>
                )}

                {/* ── Return Policy (NEW) ── */}
                <ReturnPolicyCard returnPolicy={product.returnPolicy} />

                {/* Highlights */}
                {product.highLight && (
                    <div className="rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Star className="h-4 w-4 text-slate-400" /> Key Highlights
                        </h3>
                        <Separator />
                        <SpecRow label="Material Type" value={product.highLight.materialtype} />
                        <SpecRow label="Usage" value={product.highLight.usage} />
                        <SpecRow label="Ingredients" value={product.highLight.ingredients} />
                        <SpecRow label="Nutrition" value={product.highLight.nutritionalInfo} />
                        <SpecRow label="Dietary" value={product.highLight.dietryPreference} />
                        <SpecRow label="Storage" value={product.highLight.storage} />
                    </div>
                )}

                {/* Customer Care */}
                {product.customerCareDetails && (
                    <div className="rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-slate-400" /> Customer Care
                        </h3>
                        <Separator />
                        <SpecRow label="Support Name" value={product.customerCareDetails.name} />
                        <SpecRow label="Email" value={product.customerCareDetails.email} />
                        <SpecRow label="Phone" value={product.customerCareDetails.phone} />
                        <SpecRow label="Address" value={product.customerCareDetails.address} />
                    </div>
                )}

                {/* SEO & Keywords */}
                <div className="rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-slate-400" /> SEO &amp; Keywords
                    </h3>
                    <Separator />

                    {product.seo && (product.seo.metaTitle || product.seo.metaDescription) && (
                        <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 mb-4">
                            <p className="text-[10px] text-slate-400 truncate">yourstore.com/products/{product.slug}</p>
                            <p className="text-[15px] text-blue-700 font-medium leading-snug">{product.seo.metaTitle || product.title}</p>
                            <p className="text-xs text-slate-600 line-clamp-2">{product.seo.metaDescription}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {(product.keywords || []).length > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Product Keywords</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {product.keywords.map(kw => (
                                        <Badge key={kw} variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 rounded-full">
                                            {kw}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.seo?.keywords && product.seo.keywords.length > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SEO Keywords</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {product.seo.keywords.map(kw => (
                                        <Badge key={kw} variant="secondary" className="text-[10px] bg-violet-50 text-violet-600 border-violet-100 rounded-full">
                                            {kw}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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
        </div>
    )
}