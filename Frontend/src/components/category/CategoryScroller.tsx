"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCategories } from '@/hooks/useCategories';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryRowSkeleton } from '../product/CategoryRowSkeleton';

// ─────────────────────────────────────────────
// LAYOUT LOGIC
//
// We want:
//   Desktop → 2 rows, 9 items per row visible
//   Mobile  → 4 rows, 4 items per row visible
//
// Approach:
//   - Split categories into chunks (pages) of pageSize items
//   - Each page is a CSS grid: rows x perRow columns
//   - Item width = 100% / perRow using CSS (no JS measurement)
//   - Pages sit side by side, each page = 100vw wide
//   - Scroll snaps page by page
// ─────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
    }
    return chunks
}

export const CategoryScroller = () => {
    const { data, isLoading } = useCategories({ isActive: true, limit: 100 });
    const categories = data?.categories || [];
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollBy = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return
        const w = scrollRef.current.clientWidth
        scrollRef.current.scrollBy({
            left: dir === 'left' ? -w : w,
            behavior: 'smooth',
        })
    }

    // Desktop: 2 rows × 9 per row = 18 per page
    const desktopPages = chunkArray(categories, 2 * 9)
    // Mobile:  4 rows × 4 per row = 16 per page
    const mobilePages = chunkArray(categories, 4 * 4)

    if (isLoading) return <CategoryRowSkeleton />
    if (!categories.length) return null

    return (
        <section className="relative w-full py-8 px-4 group/section">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Browse Categories<span className="text-[#FF3269]">.</span>
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline" size="icon"
                        onClick={() => scrollBy('left')}
                        className="rounded-full h-8 w-8 border-slate-200 hover:bg-[#FF3269] hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline" size="icon"
                        onClick={() => scrollBy('right')}
                        className="rounded-full h-8 w-8 border-slate-200 hover:bg-[#FF3269] hover:text-white transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Scroll container */}
            <div className="relative overflow-hidden">

                {/* Edge fades */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none opacity-0 group-hover/section:opacity-100 transition-opacity" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none opacity-0 group-hover/section:opacity-100 transition-opacity" />

                <div
                    ref={scrollRef}
                    className="overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {/* ── MOBILE layout (hidden on md+) ── */}
                    <div className="flex md:hidden">
                        {mobilePages.map((page, pi) => (
                            <div
                                key={pi}
                                className="shrink-0 w-screen"
                                style={{
                                    scrollSnapAlign: 'start',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gridTemplateRows: 'repeat(4, auto)',
                                    gap: '12px 0',
                                    paddingRight: 16,
                                }}
                            >
                                {page.map((cat: any) => (
                                    <CategoryItem key={cat._id} cat={cat} size="sm" />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* ── DESKTOP layout (hidden below md) ── */}
                    <div className="hidden md:flex">
                        {desktopPages.map((page, pi) => (
                            <div
                                key={pi}
                                className="shrink-0 w-full"
                                style={{
                                    scrollSnapAlign: 'start',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(9, 1fr)',
                                    gridTemplateRows: 'repeat(2, auto)',
                                    gap: '20px 0',
                                }}
                            >
                                {page.map((cat: any) => (
                                    <CategoryItem key={cat._id} cat={cat} size="lg" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─────────────────────────────────────────────
// CATEGORY ITEM
// ─────────────────────────────────────────────

function CategoryItem({ cat, size }: { cat: any; size: 'sm' | 'lg' }) {
    const displayImage = cat.image || cat.productType?.image
    const isSm = size === 'sm'

    return (
        <Link
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 text-center group px-1"
        >
            <div className={`
                relative rounded-2xl bg-slate-50 overflow-hidden border border-slate-100
                transition-all duration-300
                group-hover:shadow-lg group-hover:shadow-[#FF3269]/15
                group-hover:-translate-y-1
                ${isSm ? 'w-16 h-16' : 'w-20 h-20 md:w-24 md:h-24'}
            `}>
                {displayImage ? (
                    <Image
                        src={displayImage}
                        alt={cat.name}
                        fill
                        className="object-cover p-1 rounded-2xl"
                        sizes={isSm ? '64px' : '96px'}
                        unoptimized
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#FF3269] font-black bg-[#FF3269]/5 text-lg">
                        {cat.name.charAt(0)}
                    </div>
                )}
            </div>
            <span className={`
                font-semibold text-slate-700 line-clamp-2 leading-tight w-full
                group-hover:text-[#FF3269] transition-colors
                ${isSm ? 'text-[10px]' : 'text-xs'}
            `}>
                {cat.name}
            </span>
        </Link>
    )
}