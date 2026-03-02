'use client'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Share2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    title: string
    brand: string
    ratingsAverage: number
    ratingsCount: number
    isNewArrival?: boolean
    categoryName?: string
    tags?: string[]
    attributes?: any[]
}

export function ProductInfo({ title, brand, ratingsAverage, ratingsCount, isNewArrival, categoryName, tags, attributes = [] }: Props) {
    const primaryAttribute = attributes.find(a =>
        ['net volume', 'net weight', 'pack size', 'volume', 'weight', 'size'].includes(a.name.toLowerCase())
    );

    return (
        <div className="max-w-lg space-y-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center text-sm font-medium text-slate-500 cursor-pointer hover:underline">
                    {brand} <ChevronRight className="h-4 w-4 ml-0.5" />
                </div>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-slate-200 hover:bg-slate-50">
                    <Share2 className="h-5 w-5 text-slate-600" />
                </Button>
            </div>

            {/* Product Title */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold leading-tight text-slate-900">
                    {title}
                </h1>
                {/* Net Qty & Ratings */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{primaryAttribute ? `Net Qty: ${primaryAttribute.value}` : brand}</span>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-green-600 text-green-600" />
                        <span className="font-bold text-green-700">{ratingsAverage}</span>
                        <span className="text-slate-400">({(ratingsCount / 1000).toFixed(1)}k)</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                    <Star className="h-3.5 w-3.5 fill-green-600 text-green-600" />
                    <span className="text-sm font-black text-green-700">{ratingsAverage?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-green-600/70 font-medium">({ratingsCount} reviews)</span>
                    {primaryAttribute && (
                        <span className="text-xs text-slate-500 font-medium ml-2">
                            {primaryAttribute.value}
                        </span>
                    )}
                </div>
            </div>

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full font-medium">#{tag}</span>
                    ))}
                </div>
            )}

        </div>
    )
}
