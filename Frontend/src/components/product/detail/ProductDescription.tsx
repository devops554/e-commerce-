'use client'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
    shortDescription?: string
    description: string
}

export function ProductDescription({ shortDescription, description }: Props) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-[32px] shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Product Description</h3>

            {shortDescription && (
                <p className="text-slate-600 font-medium leading-relaxed text-sm border-b border-dashed border-slate-200 pb-4">{shortDescription}</p>
            )}

            <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[2000px]' : 'max-h-32'}`}>
                <div
                    className="prose prose-sm prose-slate max-w-none text-slate-600 font-medium"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            </div>

            {description && (
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="flex items-center gap-1 text-primary font-bold text-sm hover:underline"
                >
                    {expanded ? <><ChevronUp className="h-4 w-4" /> Show less</> : <><ChevronDown className="h-4 w-4" /> Read more</>}
                </button>
            )}
        </div>
    )
}
