"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Receipt, ExternalLink } from 'lucide-react'

const GST_RATES = [0, 3, 5, 12, 18, 28]

interface ProductGstSectionProps {
    data: any
    onChange: (field: string, value: any) => void
}

export default function ProductGstSection({ data, onChange }: ProductGstSectionProps) {
    const gst = data.gst || { hsnCode: '', gstRate: 18, includedInPrice: true }

    const handleGstChange = (key: string, value: any) => {
        onChange('gst', { ...gst, [key]: value })
    }

    const hsnError = gst.hsnCode && !/^\d{4}(\d{4})?$/.test(gst.hsnCode)
        ? 'HSN must be exactly 4 or 8 digits'
        : null

    return (
        <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-600" />
                    Tax &amp; GST
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

                {/* HSN Code */}
                <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Label className="text-sm font-bold">
                        HSN / SAC Code <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        placeholder="e.g. 6109 or 61091000"
                        maxLength={8}
                        value={gst.hsnCode || ''}
                        onChange={(e) => handleGstChange('hsnCode', e.target.value.replace(/\D/g, ''))}
                        className={`rounded-xl font-mono ${hsnError ? 'border-rose-400 focus-visible:ring-rose-300' : 'border-slate-200'}`}
                    />
                    {hsnError ? (
                        <p className="text-[10px] text-rose-500 font-bold">{hsnError}</p>
                    ) : (
                        <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                            4 or 8 digit code.
                            <a
                                href="https://www.cbic-gst.gov.in/gst-goods-services-rates.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline inline-flex items-center gap-0.5"
                            >
                                Find yours at CBIC <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                        </p>
                    )}
                </div>

                {/* GST Rate */}
                <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Label className="text-sm font-bold">
                        GST Rate <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                        value={gst.gstRate !== undefined ? String(gst.gstRate) : ''}
                        onValueChange={(v) => handleGstChange('gstRate', Number(v))}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                            <SelectValue placeholder="Select GST rate…" />
                        </SelectTrigger>
                        <SelectContent>
                            {GST_RATES.map((rate) => (
                                <SelectItem key={rate} value={String(rate)}>
                                    {rate}%{rate === 0 ? '  (Exempt)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-slate-400 italic">
                        Standard rates: 0% · 3% · 5% · 12% · 18% · 28%
                    </p>
                </div>

                {/* includedInPrice toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <div className="space-y-0.5 pr-4">
                        <Label className="text-sm font-bold text-emerald-800">Price includes GST?</Label>
                        <p className="text-[10px] text-slate-500">
                            <strong>ON</strong> = customers see the GST-inclusive price (recommended for B2C).
                            The taxable base is back-calculated automatically.
                        </p>
                    </div>
                    <Switch
                        checked={gst.includedInPrice !== false}
                        onCheckedChange={(checked) => handleGstChange('includedInPrice', checked)}
                        className="data-[state=checked]:bg-emerald-600 shrink-0"
                    />
                </div>

                {/* Summary chip */}
                {gst.hsnCode && gst.gstRate !== undefined && !hsnError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slateald-100 text-xs font-bold text-slate-600">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        HSN {gst.hsnCode} · {gst.gstRate}% GST ·{' '}
                        {gst.includedInPrice !== false ? 'Tax inclusive' : 'Tax exclusive'}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
