"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from "@/components/ui/skeleton"
import { useCategories } from '@/hooks/useCategories'

interface Category {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    productType?: {
        image?: string;
    };
}

export const CategoryScroller = () => {
    const { data, isLoading } = useCategories({ isActive: true, parentId: null, limit: 50 })
    const categories = data?.categories || []

    if (isLoading) return <CategorySkeleton />

    return (
        <section className="w-full py-6 px-4">
            {/* Mobile: 4-row grid with horizontal scroll */}
            <div className="md:hidden overflow-x-auto scrollbar-hide">
                <div
                    className="grid gap-3"
                    style={{
                        gridTemplateRows: 'repeat(4, auto)',
                        gridAutoFlow: 'column',
                        gridAutoColumns: 'min-content',
                    }}
                >
                    {categories.map((cat: Category) => {
                        const displayImage = cat.image || cat.productType?.image;
                        return (
                            <Link
                                key={cat._id}
                                href={`/category/${cat.slug}`}
                                className="group flex flex-col items-center gap-2 text-center w-[80px]"
                            >
                                <div className="h-[72px] w-[72px] rounded-2xl bg-[#F3F4F6] overflow-hidden transition-transform group-hover:scale-105 duration-300 shadow-sm flex-shrink-0">
                                    {displayImage ? (
                                        <div className="relative h-full w-full">
                                            <Image
                                                src={displayImage}
                                                alt={cat.name}
                                                fill
                                                sizes="72px"
                                                className="object-cover rounded-2xl"
                                                priority={false}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm font-medium">
                                            {cat.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-medium leading-tight text-slate-800 line-clamp-2 w-full">
                                    {cat.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Desktop: 2-row grid with horizontal scroll */}
            <div className="hidden md:block overflow-x-auto scrollbar-hide">
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateRows: 'repeat(2, auto)',
                        gridAutoFlow: 'column',
                        gridAutoColumns: 'min-content',
                    }}
                >
                    {categories.map((cat: Category) => {
                        const displayImage = cat.image || cat.productType?.image;
                        return (
                            <Link
                                key={cat._id}
                                href={`/category/${cat.slug}`}
                                className="group flex flex-col items-center gap-3 text-center w-[110px]"
                            >
                                <div className="h-28 w-28 rounded-2xl bg-[#F3F4F6] overflow-hidden transition-transform group-hover:scale-105 duration-300 shadow-sm flex-shrink-0">
                                    {displayImage ? (
                                        <div className="relative h-full w-full">
                                            <Image
                                                src={displayImage}
                                                alt={cat.name}
                                                fill
                                                sizes="112px"
                                                className="object-cover rounded-2xl"
                                                priority={false}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm font-medium">
                                            {cat.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium leading-tight text-slate-800 line-clamp-2 max-w-[100px]">
                                    {cat.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}

const CategorySkeleton = () => {
    return (
        <div className="w-full py-6 px-4">
            {/* Mobile skeleton: 4 rows */}
            <div className="md:hidden overflow-x-auto scrollbar-hide">
                <div
                    className="grid gap-3"
                    style={{
                        gridTemplateRows: 'repeat(4, auto)',
                        gridAutoFlow: 'column',
                        gridAutoColumns: 'min-content',
                    }}
                >
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-[80px]">
                            <Skeleton className="h-[72px] w-[72px] rounded-2xl bg-slate-100" />
                            <Skeleton className="h-3 w-14 rounded-full bg-slate-100" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop skeleton: 2 rows */}
            <div className="hidden md:block overflow-x-auto scrollbar-hide">
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateRows: 'repeat(2, auto)',
                        gridAutoFlow: 'column',
                        gridAutoColumns: 'min-content',
                    }}
                >
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 w-[110px]">
                            <Skeleton className="h-28 w-28 rounded-2xl bg-slate-100" />
                            <Skeleton className="h-4 w-16 rounded-full bg-slate-100" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}