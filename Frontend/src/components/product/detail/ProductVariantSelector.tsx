'use client'
import React from 'react'
import { ProductVariant } from '@/services/product.service'
import { useAuth } from '@/providers/AuthContext'

interface Props {
    variants: ProductVariant[]
    selectedVariant: ProductVariant | null
    onSelect: (variant: ProductVariant) => void
}

export function ProductVariantSelector({ variants, selectedVariant, onSelect }: Props) {
    const { user } = useAuth()

    if (!variants || variants.length === 0) return null

    const canSeeRealStock = user && ['admin', 'subadmin', 'manager', 'seller'].includes(user.role?.toLowerCase())

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Variant</h3>
            <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                    const getAttr = (name: string) => v.attributes?.find(a => a.name.toLowerCase() === name.toLowerCase())?.value
                    const label = getAttr('size') || getAttr('weight') || getAttr('model') || getAttr('color') || v.sku
                    const isSelected = selectedVariant?._id === v._id
                    const inStock = v.stock > 0
                    return (
                        <button
                            key={v._id}
                            onClick={() => onSelect(v)}
                            disabled={!inStock}
                            className={`px-4 py-2.5 rounded-2xl border-2 transition-all font-bold text-sm relative ${isSelected
                                ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10'
                                : inStock
                                    ? 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                                    : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed line-through'
                                }`}
                        >
                            {label}
                            {!inStock && (
                                <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-red-500 text-white px-1 rounded-full">OOS</span>
                            )}
                        </button>
                    )
                })}
            </div>
            {selectedVariant && (
                <p className="text-xs text-slate-400 font-medium">
                    SKU: <span className="font-mono text-slate-600">{selectedVariant.sku}</span>
                    {selectedVariant.stock > 0 && (
                        <span className="ml-3 text-green-600 font-bold">
                            ✓ {canSeeRealStock ? `${selectedVariant.stock} in stock` : 'In Stock'}
                        </span>
                    )}
                </p>
            )}
        </div>
    )
}
