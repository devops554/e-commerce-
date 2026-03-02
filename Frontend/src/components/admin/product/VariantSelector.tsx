"use client"

import React from 'react'
import { ProductVariant } from '@/services/product.service'
import { Badge } from '@/components/ui/badge'
import { Layers, Package, Tag, Check, Info } from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface VariantSelectorProps {
    variants: ProductVariant[]
    selectedVariant: ProductVariant | null
    onSelect: (variant: ProductVariant) => void
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
    if (!variants || variants.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                        <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        Product Variants
                        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
                            {variants.length}
                        </span>
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variants.map((v) => {
                    const isSelected = selectedVariant?._id === v._id
                    const variantAttributes = v.attributes || []

                    return (
                        <button
                            key={v._id}
                            type="button"
                            onClick={() => onSelect(v)}
                            className={`group relative text-left p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                ? 'border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/5'
                                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-3 right-3 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Check className="h-3 w-3 text-white stroke-3" />
                                </div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Tag className="h-2.5 w-2.5" />
                                        {v.sku}
                                    </p>
                                    {variantAttributes.length > 0 && (
                                        <p className="mt-1 text-sm font-bold text-slate-900 line-clamp-1">
                                            {variantAttributes.map(a => a.value).join(' / ')}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-end justify-between gap-2">
                                    <div className="space-y-1">
                                        {v.discountPrice ? (
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-lg font-black text-slate-900">₹{v.discountPrice.toLocaleString('en-IN')}</span>
                                                <span className="text-xs text-slate-400 line-through">₹{v.price.toLocaleString('en-IN')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-lg font-black text-slate-900">₹{v.price.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5">
                                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 h-5 rounded-full ${v.stock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {v.stock > 0 ? `${v.stock} Stock` : 'OOS'}
                                        </Badge>
                                        {v.discount && v.discount > 0 ? (
                                            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">-{v.discount}%</span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

        </div>
    )
}
