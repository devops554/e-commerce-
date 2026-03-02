"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from '@/hooks/useCategories';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryRowSkeleton } from '../product/CategoryRowSkeleton';

export const CategoryScroller = () => {
    const { data, isLoading } = useCategories({ isActive: true, parentId: null, limit: 50 });
    const categories = data?.categories || [];
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const moveAmount = clientWidth * 0.8;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - moveAmount : scrollLeft + moveAmount,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading) return <CategoryRowSkeleton />;

    return (
        <section className="relative w-full py-8 px-4 group/container overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Browse Categories<span className="text-[#FF3269]">.</span>
                </h2>
                <div className="flex m gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scroll('left')}
                        className="rounded-full h-8 w-8 border-slate-200 hover:bg-[#FF3269] hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => scroll('right')}
                        className="rounded-full h-8 w-8 border-slate-200 hover:bg-[#FF3269] hover:text-white transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Scroll Container with Fade Mask */}
            <div className="relative">
                {/* Optional: Gradient Fades for Premium Look */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-white to-transparent z-10 pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white to-transparent z-10 pointer-events-none opacity-0 group-hover/container:opacity-100 transition-opacity" />

                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto scrollbar-hide scroll-smooth"
                >
                    <div
                        className="grid gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8"
                        style={{
                            gridAutoFlow: 'column',
                            gridAutoColumns: 'min-content',
                            // Logic: 4 rows on small screens, 2 rows on md+
                            gridTemplateRows: 'repeat(var(--row-count, 4), auto)',
                        } as React.CSSProperties}
                    >
                        {/* CSS Variable Hack for Responsive Rows */}
                        <style jsx>{`
                            div { --row-count: 4; }
                            @media (min-width: 768px) { div { --row-count: 2; } }
                        `}</style>

                        {categories.map((cat: any) => {
                            const displayImage = cat.image || cat.productType?.image;
                            return (
                                <Link
                                    key={cat._id}
                                    href={`/category/${cat.slug}`}
                                    className="flex flex-col items-center gap-2 text-center w-[85px] md:w-[120px] group"
                                >
                                    <div className="relative h-[72px] w-[72px] md:h-28 md:w-28 rounded-3xl bg-slate-50 overflow-hidden border border-slate-100 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#FF3269]/10 group-hover:-translate-y-1">
                                        {displayImage ? (
                                            <Image
                                                src={displayImage}
                                                alt={cat.name}
                                                fill
                                                className="object-cover p-1 rounded-3xl"
                                                sizes="(max-width: 768px) 72px, 112px"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-[#FF3269] font-bold bg-[#FF3269]/5">
                                                {cat.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[11px] md:text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-[#FF3269] transition-colors">
                                        {cat.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};