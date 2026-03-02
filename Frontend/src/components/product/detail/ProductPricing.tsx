'use client'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ProductVariant } from '@/services/product.service'

interface Props {
    variant: ProductVariant | null
}

export function ProductPricing({ variant }: Props) {
    if (!variant) return null

    const effectivePrice = variant.discountPrice > 0 ? variant.discountPrice : variant.price
    const hasDiscount = variant.discountPrice > 0 && variant.price > variant.discountPrice
    const discountPct = hasDiscount
        ? Math.round(((variant.price - variant.discountPrice) / variant.price) * 100)
        : 0

    return (
        <div className="flex items-end gap-3 flex-wrap">
            <span className="text-4xl font-black text-primary leading-none">₹{effectivePrice.toLocaleString('en-IN')}</span>
            {hasDiscount && (
                <>
                    <span className="text-lg text-slate-400 line-through decoration-slate-300 font-bold mb-1">
                        ₹{variant.price.toLocaleString('en-IN')}
                    </span>
                    <Badge className="mb-1.5 bg-green-500 hover:bg-green-600 font-black border-none text-white">
                        SAVE {discountPct}%
                    </Badge>
                </>
            )}
        </div>
    )
}
