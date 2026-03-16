"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'
import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'

export const CategorySidebar = ({ productType }: { productType?: string }) => {
    const params = useParams()
    const currentSlug = params.slug as string
    const [catSearch, setCatSearch] = React.useState('')

    // Fetch categories for the sidebar, optionally filtered by productType
    const { data, isLoading } = useCategories({
        isActive: true,
        limit: 50,
        productType: productType
    })
    const categories = data?.categories || []

    const filteredCategories = React.useMemo(() => {
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(catSearch.toLowerCase())
        )
    }, [categories, catSearch])

    if (isLoading) {
        return (
            <div className="space-y-4 pr-4">
                <Skeleton className="h-8 w-32 mb-6" />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <aside className="sticky top-24 self-start w-full pr-4">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-black text-slate-900 mb-4 px-2 tracking-tight">Categories</h2>
                    <div className="px-2 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search categories..."
                                value={catSearch}
                                onChange={(e) => setCatSearch(e.target.value)}
                                className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-none text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="space-y-1">
                        {filteredCategories.length > 0 ? filteredCategories.map((cat) => {
                            const isActive = currentSlug === cat.slug
                            const displayImage = cat.image || cat.productType?.image

                            return (
                                <Link
                                    key={cat._id}
                                    href={`/category/${cat.slug}`}
                                    className={`flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 group ${isActive
                                        ? 'bg-primary/5 text-primary shadow-sm'
                                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <div className={`relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border-2 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'border-primary' : 'border-slate-100 group-hover:border-slate-200'
                                        }`}>
                                        {displayImage ? (
                                            <Image
                                                src={displayImage}
                                                alt={cat.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-xs">
                                                {cat.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-sm font-bold tracking-tight line-clamp-2 ${isActive ? 'text-primary' : ''}`}>
                                        {cat.name}
                                    </span>
                                </Link>
                            )
                        }) : (
                            <div className="py-8 text-center px-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching categories</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </aside>
    )
}
