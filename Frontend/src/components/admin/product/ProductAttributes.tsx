"use client"

import React, { useEffect, useState } from 'react'
import { Layers, Cpu, Sparkles } from 'lucide-react'

interface Attribute {
    name: string
    value: string
}

interface ProductAttributesProps {
    productAttributes?: Attribute[]
    selectedVariantAttributes?: Attribute[]
    isVariantSelected: boolean
}

// Deterministic soft color per attribute name
function getAccentClass(name: string): string {
    const palette = [
        'bg-blue-500',
        'bg-violet-500',
        'bg-emerald-500',
        'bg-amber-500',
        'bg-rose-500',
        'bg-cyan-500',
        'bg-indigo-500',
        'bg-teal-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff
    return palette[hash % palette.length]
}

function AttributeRow({
    label,
    value,
    index,
    animate,
}: {
    label: string
    value: string
    index: number
    animate: boolean
}) {
    const accent = getAccentClass(label)

    return (
        <div
            className="group relative flex items-start gap-4 py-3 px-4 rounded-xl transition-all duration-200 hover:bg-slate-50"
            style={{
                animationDelay: animate ? `${index * 40}ms` : undefined,
                animation: animate ? 'fadeSlideIn 0.25s ease both' : undefined,
            }}
        >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

            {/* Label */}
            <div className="w-28 shrink-0 pt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 leading-tight">
                    {label}
                </span>
            </div>

            {/* Divider dot */}
            <div className="shrink-0 mt-[7px]">
                <div className={`w-1 h-1 rounded-full ${accent} opacity-40`} />
            </div>

            {/* Value */}
            <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-slate-800 leading-snug break-words">
                    {value}
                </span>
            </div>
        </div>
    )
}

export function ProductAttributes({
    productAttributes = [],
    selectedVariantAttributes = [],
    isVariantSelected,
}: ProductAttributesProps) {
    const displayAttributes = isVariantSelected ? selectedVariantAttributes : productAttributes
    const hasAttributes = displayAttributes.length > 0
    const [animKey, setAnimKey] = useState(0)

    // Retrigger row animations whenever the source flips
    useEffect(() => {
        setAnimKey(k => k + 1)
    }, [isVariantSelected, displayAttributes.length])

    if (!hasAttributes && !isVariantSelected) return null

    return (
        <>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">

                {/* ── Header ── */}
                <div className={`
                    px-5 py-4 flex items-center justify-between border-b
                    transition-colors duration-300
                    ${isVariantSelected
                        ? 'bg-indigo-50/60 border-indigo-100'
                        : 'bg-slate-50 border-slate-100'
                    }
                `}>
                    <div className="flex items-center gap-2.5">
                        <div className={`
                            p-1.5 rounded-lg transition-colors duration-300
                            ${isVariantSelected ? 'bg-indigo-100' : 'bg-slate-200'}
                        `}>
                            {isVariantSelected
                                ? <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                                : <Layers className="h-3.5 w-3.5 text-slate-500" />
                            }
                        </div>
                        <span className={`
                            text-xs font-black uppercase tracking-widest transition-colors duration-300
                            ${isVariantSelected ? 'text-indigo-700' : 'text-slate-600'}
                        `}>
                            {isVariantSelected ? 'Variant attributes' : 'Product attributes'}
                        </span>
                    </div>

                    {/* Count badge */}
                    {hasAttributes && (
                        <span className={`
                            text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums
                            transition-colors duration-300
                            ${isVariantSelected
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-slate-200 text-slate-500'
                            }
                        `}>
                            {displayAttributes.length} {displayAttributes.length === 1 ? 'attr' : 'attrs'}
                        </span>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="px-2 py-2">
                    {hasAttributes ? (
                        <div key={animKey}>
                            {displayAttributes.map((attr, idx) => (
                                <AttributeRow
                                    key={`${attr.name}-${idx}`}
                                    label={attr.name}
                                    value={attr.value}
                                    index={idx}
                                    animate={true}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Sparkles className="h-4.5 w-4.5 text-slate-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    No attributes
                                </p>
                                <p className="text-[11px] text-slate-300 leading-relaxed max-w-[180px]">
                                    {isVariantSelected
                                        ? 'This variant has no specific attributes defined.'
                                        : 'Select a variant to view its attributes.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer hint when variant is active ── */}
                {isVariantSelected && hasAttributes && (
                    <div className="px-5 py-2.5 border-t border-indigo-50 bg-indigo-50/30">
                        <p className="text-[10px] text-indigo-400 font-medium">
                            Showing attributes for the selected variant · hover rows to highlight
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}