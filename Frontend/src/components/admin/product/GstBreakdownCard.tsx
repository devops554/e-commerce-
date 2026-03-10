"use client"

import React from 'react'

interface GstBreakdown {
    gstRate: number
    basePrice: number
    cgst: number
    sgst: number
    igst: number
    gstAmountPerUnit: number
    sellingPrice: number
}

// Pure computation matching gst.util.ts logic
function computeGst(sellingPrice: number, gstRate: number, includedInPrice: boolean): GstBreakdown | null {
    if (!sellingPrice || gstRate === undefined) return null
    let basePrice: number
    let finalSellingPrice: number

    if (includedInPrice) {
        basePrice = gstRate > 0 ? sellingPrice / (1 + gstRate / 100) : sellingPrice
        finalSellingPrice = sellingPrice
    } else {
        basePrice = sellingPrice
        finalSellingPrice = sellingPrice * (1 + gstRate / 100)
    }

    const round2 = (n: number) => Math.round(n * 100) / 100
    const gstAmount = round2(finalSellingPrice - basePrice)
    basePrice = round2(basePrice)
    finalSellingPrice = round2(finalSellingPrice)

    return {
        gstRate,
        basePrice,
        gstAmountPerUnit: gstAmount,
        cgst: round2(gstAmount / 2),
        sgst: round2(gstAmount / 2),
        igst: 0, // intra-state preview by default
        sellingPrice: finalSellingPrice,
    }
}

interface GstBreakdownCardProps {
    price: number
    gstRate?: number
    includedInPrice?: boolean
}

export default function GstBreakdownCard({ price, gstRate, includedInPrice = true }: GstBreakdownCardProps) {
    if (gstRate === undefined || !price) return null

    const breakdown = computeGst(price, gstRate, includedInPrice)
    if (!breakdown) return null

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    return (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 overflow-hidden text-xs mt-2">
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-100/70 border-b border-emerald-100">
                <span className="font-black text-emerald-800 uppercase tracking-wider text-[10px]">
                    GST Breakdown — {gstRate}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Intra-state preview</span>
            </div>
            <div className="px-3 py-2 space-y-1 font-medium text-slate-600">
                <div className="flex justify-between">
                    <span>Base Price (taxable)</span>
                    <span className="font-bold text-slate-800">{fmt(breakdown.basePrice)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                    <span>CGST ({gstRate / 2}%)</span>
                    <span>{fmt(breakdown.cgst)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                    <span>SGST ({gstRate / 2}%)</span>
                    <span>{fmt(breakdown.sgst)}</span>
                </div>
                <div className="border-t border-emerald-200 mt-1 pt-1 flex justify-between font-black text-slate-900">
                    <span>Selling Price</span>
                    <span className="text-emerald-700">{fmt(breakdown.sellingPrice)}</span>
                </div>
            </div>
        </div>
    )
}
