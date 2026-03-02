"use client"

import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"

export const CategoryRowSkeleton = () => {
    return (
        <div className="space-y-4 py-8 px-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48 bg-slate-200 rounded-lg" />
                <Skeleton className="h-4 w-20 bg-slate-200 rounded-lg" />
            </div>
            <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="min-w-[200px] aspect-4/5 bg-slate-100 animate-pulse rounded-2xl" />
                ))}
            </div>
        </div>
    )
}
