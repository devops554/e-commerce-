"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50/60 animate-pulse">
            {/* Hero */}
            <div className="bg-slate-900 px-4 sm:px-6 lg:px-8 pt-10 pb-24">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-5">
                    <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-[24px] bg-slate-700 flex-shrink-0" />
                    <div className="space-y-3 text-center sm:text-left flex-1">
                        <Skeleton className="h-8 w-48 bg-slate-700 mx-auto sm:mx-0" />
                        <Skeleton className="h-4 w-36 bg-slate-700/60 mx-auto sm:mx-0" />
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            <Skeleton className="h-7 w-24 rounded-xl bg-slate-700/50" />
                            <Skeleton className="h-7 w-24 rounded-xl bg-slate-700/50" />
                            <Skeleton className="h-7 w-28 rounded-xl bg-slate-700/50" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-xl mx-auto sm:mx-0" />
                            <div className="space-y-1.5 text-center sm:text-left">
                                <Skeleton className="h-5 w-8 mx-auto sm:mx-0" />
                                <Skeleton className="h-3 w-16 mx-auto sm:mx-0" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1 flex gap-1 mb-6">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="flex-1 h-10 rounded-xl" />
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-4 pb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-36 rounded-3xl" />
                        ))}
                    </div>
                    <Skeleton className="h-48 rounded-3xl" />
                </div>
            </div>
        </div>
    )
}