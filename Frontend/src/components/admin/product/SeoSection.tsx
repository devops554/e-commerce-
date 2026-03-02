"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Search } from 'lucide-react'

interface SeoSectionProps {
    data: any;
    onChange: (field: string, value: any) => void;
}

export default function SeoSection({ data, onChange }: SeoSectionProps) {
    const [kwInput, setKwInput] = React.useState('')

    const seo = data.seo || {}
    const keywords: string[] = Array.isArray(seo.keywords) ? seo.keywords : []

    const handleSeoChange = (field: string, value: any) => {
        onChange('seo', { ...seo, [field]: value })
    }

    const handleAddKeyword = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && kwInput.trim()) {
            e.preventDefault()
            if (!keywords.includes(kwInput.trim())) {
                handleSeoChange('keywords', [...keywords, kwInput.trim()])
            }
            setKwInput('')
        }
    }

    const metaDescLength = (seo.metaDescription || '').length
    const metaTitleLength = (seo.metaTitle || '').length

    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                        <Search className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">SEO & Meta</CardTitle>
                        <p className="text-xs text-slate-400 mt-0.5">Optimize how this product appears in search results</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">

                {/* Meta Title */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-slate-700">Meta Title</Label>
                        <span className={`text-[10px] font-medium ${metaTitleLength > 60 ? 'text-red-500' : metaTitleLength > 50 ? 'text-amber-500' : 'text-slate-400'}`}>
                            {metaTitleLength}/60
                        </span>
                    </div>
                    <Input
                        placeholder="e.g. Buy iPhone 15 Pro Max Online at Best Price"
                        value={seo.metaTitle || ''}
                        onChange={(e) => handleSeoChange('metaTitle', e.target.value)}
                        className="rounded-xl h-11 border-slate-200"
                        maxLength={70}
                    />
                    <p className="text-[10px] text-slate-400">Recommended: 50–60 characters. Defaults to product title if empty.</p>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-slate-700">Meta Description</Label>
                        <span className={`text-[10px] font-medium ${metaDescLength > 160 ? 'text-red-500' : metaDescLength > 140 ? 'text-amber-500' : 'text-slate-400'}`}>
                            {metaDescLength}/160
                        </span>
                    </div>
                    <Textarea
                        placeholder="A brief, compelling description of this product for search engines..."
                        value={seo.metaDescription || ''}
                        onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
                        className="rounded-xl border-slate-200 min-h-[90px] resize-none"
                        maxLength={180}
                    />
                    <p className="text-[10px] text-slate-400">Recommended: 120–160 characters.</p>
                </div>

                {/* Google Preview */}
                {(seo.metaTitle || seo.metaDescription) && (
                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-1">
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Google Preview</p>
                        <p className="text-xs text-slate-500 truncate">yourstore.com/products/{data.slug || 'product-slug'}</p>
                        <p className="text-[15px] text-blue-700 font-medium leading-snug line-clamp-1">
                            {seo.metaTitle || data.title || 'Product Title'}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {seo.metaDescription || data.shortDescription || 'Product description will appear here...'}
                        </p>
                    </div>
                )}

                {/* Keywords */}
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Keywords</Label>
                    <Input
                        placeholder="Type keyword and press Enter"
                        value={kwInput}
                        onChange={(e) => setKwInput(e.target.value)}
                        onKeyDown={handleAddKeyword}
                        className="rounded-xl h-11 border-slate-200"
                    />
                    {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {keywords.map((kw) => (
                                <Badge
                                    key={kw}
                                    variant="secondary"
                                    className="pl-2.5 pr-1 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-xs"
                                >
                                    {kw}
                                    <button
                                        type="button"
                                        onClick={() => handleSeoChange('keywords', keywords.filter(k => k !== kw))}
                                        className="ml-1.5 h-4 w-4 rounded-full hover:bg-violet-200 flex items-center justify-center transition-colors"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                    <p className="text-[10px] text-slate-400">Press Enter after each keyword to add it.</p>
                </div>

            </CardContent>
        </Card>
    )
}
