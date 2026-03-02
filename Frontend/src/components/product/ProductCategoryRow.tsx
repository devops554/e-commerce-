"use client"

import React from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { Category } from '@/services/category.service'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

import { CategoryRowSkeleton } from './CategoryRowSkeleton'

interface ProductCategoryRowProps {
    category: Category;
}

export const ProductCategoryRow = ({ category }: ProductCategoryRowProps) => {
    const { data, isLoading } = useProducts({
        category: category._id,
        limit: 10,
        isActive: true
    }, true)

    const products = data?.products || []

    if (isLoading) {
        return <CategoryRowSkeleton />
    }

    if (products.length === 0) return null

    return (
        <section className="space-y-4 py-6 px-4">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{category.name}</h2>
                    {/* {category.description && (
                        <p className="text-sm text-slate-500 font-medium">{category.description}</p>
                    )} */}
                </div>
                <Button variant="ghost" className="text-green-700 font-bold hover:text-green-800 hover:bg-green-50 rounded-xl">
                    See All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>

            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full relative px-2"
            >
                <CarouselContent className="-ml-3 md:-ml-4">
                    {products.map((product: any) => {
                        const firstVariant = product.variants?.[0]
                        const price = firstVariant?.price || 0
                        const discountPrice = firstVariant?.discountPrice || 0
                        return (
                            <CarouselItem key={product._id} className="pl-3 md:pl-4 basis-[40%] sm:basis-1/4 md:basis-[20%] lg:basis-[16.666%]">
                                <ProductCard
                                    id={firstVariant?._id || product._id}
                                    productId={product._id}
                                    variantId={firstVariant?._id || product._id}
                                    slug={product.slug}
                                    title={product.title}
                                    brand={product.brand}
                                    tag={product.tags}
                                    price={price}
                                    discountPrice={discountPrice}
                                    attributes={firstVariant?.attributes}
                                    stock={firstVariant?.stock}
                                    image={product.thumbnail?.url || ''}
                                    images={[
                                        product.thumbnail?.url,
                                        ...(product.images?.map((img: any) => img.url) || []),
                                        ...(product.variants?.flatMap((v: any) =>
                                            v.images?.map((img: any) => img.url) || []
                                        ) || [])
                                    ].filter(Boolean)}
                                    weight={product.shortDescription || ''}
                                    rating={product.ratingsAverage || 0}
                                    reviewCount={product.ratingsCount || 0}
                                />
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
                <CarouselPrevious className="md:flex -left-4 bg-white shadow-lg border-slate-100 hover:bg-slate-50" />
                <CarouselNext className="md:flex -right-4 bg-white shadow-lg border-slate-100 hover:bg-slate-50" />
            </Carousel>
        </section>
    )
}
