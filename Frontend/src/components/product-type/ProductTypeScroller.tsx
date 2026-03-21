"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductTypes } from '@/hooks/useProductTypes'

interface ProductType {
    _id: string;
    name: string;
    slug: string;
    image?: string;
}

export const ProductTypeScroller = () => {
    const { data, isLoading } = useProductTypes({ isActive: true, limit: 20 })
    const productTypes = data?.productTypes || []
,
    // Create a new array with "All" at the beginning
    const allProductTypes = [
        { _id: 'all', name: 'All', slug: 'all', image: '' },
        ...productTypes
    ]

    if (isLoading) return <ProductTypeSkeleton />
    if (productTypes.length === 0) return null

    return (
        <section className="w-full py-4 px-4 border-b border-gray-200">
            <div className="container mx-auto">
                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full relative"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {allProductTypes.map((type: ProductType) => (
                            <CarouselItem key={type._id} className="pl-10 md:pl-10 basis-auto">
                                <Link
                                    href={type.slug === 'all' ? '/product-type/' : `/product-type/${type.slug}`}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    {/* Image Container - Fixed size h-20 w-20 */}
                                    <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden border-2 border-transparent group-hover:border-green-500 transition-all duration-300 shadow-sm group-hover:shadow-md">
                                        {type.image ? (
                                            <Image
                                                src={type.image}
                                                alt={type.name}
                                                width={20}
                                                height={20}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                                <span className="text-xs font-medium text-gray-400">
                                                    {type.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Name */}
                                    <span className="text-xs font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                                        {type.name}
                                    </span>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Navigation Controls */}
                    <CarouselPrevious className="flex -left-4 bg-white shadow-md border-gray-200 hover:bg-gray-50 text-gray-600 w-8 h-8" />
                    <CarouselNext className="flex -right-4 bg-white shadow-md border-gray-200 hover:bg-gray-50 text-gray-600 w-8 h-8" />
                </Carousel>
            </div>
        </section>
    )
}

const ProductTypeSkeleton = () => {
    return (
        <div className="w-full py-4 px-4 border-b border-gray-200">
            <div className="container mx-auto">
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <Skeleton className="h-20 w-20 rounded-full bg-gray-100" />
                            <Skeleton className="h-3 w-12 rounded-full bg-gray-100" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
