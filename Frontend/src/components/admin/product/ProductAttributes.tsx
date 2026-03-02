"use client"

import React from 'react'
import { Separator } from '@/components/ui/separator'
import { Boxes, Info } from 'lucide-react'

interface Attribute {
    name: string
    value: string
}

interface ProductAttributesProps {
    productAttributes?: Attribute[]
    selectedVariantAttributes?: Attribute[]
    isVariantSelected: boolean
}

function AttributeRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-1 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 mt-0.5">{label}</span>
            <span className="text-sm text-slate-800 text-right font-semibold leading-tight">{value}</span>
        </div>
    )
}

export function ProductAttributes({
    productAttributes = [],
    selectedVariantAttributes = [],
    isVariantSelected
}: ProductAttributesProps) {
    const displayAttributes = isVariantSelected ? selectedVariantAttributes : productAttributes
    const hasAttributes = displayAttributes.length > 0

    if (!hasAttributes && !isVariantSelected) return null

    return (
        <div className="rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 bg-white transition-all duration-300">
            <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center gap-2.5 uppercase tracking-tight text-sm">
                    <div className={`p-1.5 rounded-lg ${isVariantSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isVariantSelected ? <Info className="h-4 w-4" /> : <Boxes className="h-4 w-4" />}
                    </div>
                    {isVariantSelected ? 'Variant Attributes' : 'Product Attributes'}
                </h3>
                {isVariantSelected && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Viewing Selected Variant
                    </span>
                )}
            </div>

            <Separator className="bg-slate-100" />

            {hasAttributes ? (
                <div className="grid grid-cols-1 divide-y divide-slate-50">
                    {displayAttributes.map((attr, idx) => (
                        <AttributeRow key={idx} label={attr.name} value={attr.value} />
                    ))}
                </div>
            ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center">
                        <Info className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium italic">No specific attributes defined for this selection</p>
                </div>
            )}
        </div>
    )
}
