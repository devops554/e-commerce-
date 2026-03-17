"use client"

import React from 'react'
import { useCategories } from '@/hooks/useCategories'
import { Category } from '@/services/category.service'
import { CategoryRowSkeleton } from './CategoryRowSkeleton'
import { HierarchicalCategoryFlow } from './HierarchicalCategoryFlow'

export const ProductDiscovery = () => {
    const [categories, setCategories] = React.useState<Category[]>([])
    const [page, setPage] = React.useState(1)
    const [hasMore, setHasMore] = React.useState(true)
    const [isFetchingMore, setIsFetchingMore] = React.useState(false)
    const observerTarget = React.useRef(null)

    // Only fetch root categories to build the discovery rows
    const { data, isLoading, isError } = useCategories({
        isActive: true,
        limit: 5,
        page: page
    })
    // console.log(data, "categories")

    React.useEffect(() => {
        if (data?.categories) {
            setCategories(prev => {
                const existingIds = new Set(prev.map(c => c._id))
                const newCategories = data.categories.filter(c => !existingIds.has(c._id))
                return [...prev, ...newCategories]
            })
            setHasMore(data.page < data.totalPages)
            setIsFetchingMore(false)
        } else if (isError) {
            setIsFetchingMore(false)
        }
    }, [data, isError])

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
                    setIsFetchingMore(true)
                    setPage(prev => prev + 1)
                }
            },
            { threshold: 0.1, rootMargin: '400px' }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [hasMore, isFetchingMore, isLoading])

    if (isLoading && page === 1) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <CategoryRowSkeleton key={i} />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-0">
            {categories.map((category: Category) => (
                <HierarchicalCategoryFlow key={category._id} parentCategory={category} />
            ))}

            {/* Sentinel for infinite scroll */}
            <div ref={observerTarget} className="h-10 w-full" />

            {isFetchingMore && (
                <div className="space-y-4">
                    <CategoryRowSkeleton />
                </div>
            )}

            {!hasMore && categories.length > 0 && (
                <div className="py-12 text-center">
                    <p className="text-slate-400 font-medium">You've reached the end of our discoveries ✨</p>
                </div>
            )}
        </div>
    )
}
