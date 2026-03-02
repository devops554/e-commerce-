'use client'
import React from 'react'
import { BarChart2 } from 'lucide-react'

interface Props {
    specifications?: Record<string, any>
    attributes?: { name: string; value: string }[]
}

function SpecRow({ label, value }: { label: string; value: any }) {
    if (!value && value !== 0) return null
    return (
        <div className="flex justify-between items-start gap-4 py-2.5 border-b border-dashed border-slate-100 last:border-0">
            <span className="text-xs font-semibold text-slate-500 shrink-0 capitalize">{label}</span>
            <span className="text-xs text-slate-800 text-right font-medium">{String(value)}</span>
        </div>
    )
}

export function ProductSpecifications({ specifications, attributes }: Props) {
    const hasSpecs = specifications && Object.keys(specifications).length > 0
    const hasAttrs = attributes && attributes.length > 0
    if (!hasSpecs && !hasAttrs) return null

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="h-4 w-4 text-slate-400" />
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Specifications</h3>
            </div>

            {hasAttrs && (
                <div className="pb-2">
                    {attributes.filter(a => a.name && a.value).map((attr, idx) => (
                        <SpecRow key={`attr-${idx}`} label={attr.name} value={attr.value} />
                    ))}
                </div>
            )}

            {hasSpecs && Object.entries(specifications!).map(([groupKey, groupVal]) => {
                if (groupKey === 'custom' && Array.isArray(groupVal)) {
                    return groupVal.map((item: any, i: number) => (
                        <SpecRow key={`custom-${i}`} label={item.key} value={item.value} />
                    ))
                }
                if (typeof groupVal === 'object' && !Array.isArray(groupVal)) {
                    return Object.entries(groupVal).map(([k, v]) => (
                        <SpecRow key={`${groupKey}-${k}`} label={k} value={v as any} />
                    ))
                }
                return <SpecRow key={groupKey} label={groupKey} value={groupVal} />
            })}
        </div>
    )
}
