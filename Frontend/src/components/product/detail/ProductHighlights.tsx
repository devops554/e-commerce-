'use client'
import React from 'react'
import { Sparkles } from 'lucide-react'

interface Highlights {
    materialtype?: string;
    ingredients?: string;
    nutritionalInfo?: string;
    usage?: string;
    dietryPreference?: string;
    storage?: string;
}

interface Props {
    highLight?: Highlights
}

function HighlightRow({ label, value }: { label: string; value: any }) {
    if (!value) return null
    return (
        <div className="flex justify-between items-start gap-4 py-2.5 border-b border-dashed border-slate-100 last:border-0">
            <span className="text-xs font-semibold text-slate-500 shrink-0 capitalize">{label}</span>
            <span className="text-xs text-slate-800 text-right font-medium">{String(value)}</span>
        </div>
    )
}

export function ProductHighlights({ highLight }: Props) {
    if (!highLight || Object.values(highLight).every(v => !v)) return null

    return (
        <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-[32px] shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Highlights</h3>
            </div>

            <div className="space-y-1">
                <HighlightRow label="Material Type" value={highLight.materialtype} />
                <HighlightRow label="Usage" value={highLight.usage} />
                <HighlightRow label="Ingredients" value={highLight.ingredients} />
                <HighlightRow label="Nutritional Info" value={highLight.nutritionalInfo} />
                <HighlightRow label="Dietary Preference" value={highLight.dietryPreference} />
                <HighlightRow label="Storage" value={highLight.storage} />
            </div>
        </div>
    )
}
