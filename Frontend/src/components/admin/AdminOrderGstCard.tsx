"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface OrderItem {
    title: string
    hsnCode?: string
    gstRate?: number
    quantity: number
    lineTaxableValue?: number
    lineCgst?: number
    lineSgst?: number
    lineIgst?: number
    lineTotalGst?: number
}

interface OrderGstSummary {
    invoiceNumber?: string
    isInterState?: boolean
    subTotal?: number
    totalCgst?: number
    totalSgst?: number
    totalIgst?: number
    totalGstAmount?: number
    shippingCharge?: number
    totalAmount?: number
    items?: OrderItem[]
    _id?: string
}

export default function AdminOrderGstCard({ order }: { order: OrderGstSummary }) {
    const router = useRouter()
    const { isInterState, items = [], invoiceNumber } = order
    const fmt = (n?: number) =>
        n !== undefined ? `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'

    // Only show if we have GST data
    const hasGst = items.some(i => i.hsnCode)
    if (!hasGst) return null

    const totals = {
        taxable: items.reduce((s, i) => s + (i.lineTaxableValue || 0), 0),
        cgst: items.reduce((s, i) => s + (i.lineCgst || 0), 0),
        sgst: items.reduce((s, i) => s + (i.lineSgst || 0), 0),
        igst: items.reduce((s, i) => s + (i.lineIgst || 0), 0),
        gst: items.reduce((s, i) => s + (i.lineTotalGst || 0), 0),
    }

    return (
        <Card className="rounded-3xl border-emerald-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6 bg-emerald-50/60 border-b border-emerald-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="text-base font-black flex items-center gap-2 text-emerald-900">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        GST Summary
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                        {invoiceNumber && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px] uppercase tracking-wide">
                                {invoiceNumber}
                            </Badge>
                        )}
                        {isInterState !== undefined && (
                            <Badge variant="outline" className={`text-[9px] font-black uppercase ${isInterState ? 'border-orange-300 text-orange-700 bg-orange-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                                {isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
                            </Badge>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-xl text-[10px] font-black uppercase border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => order._id && router.push(`/admin/orders/${order._id}/invoice`)}
                        >
                            <Printer className="w-3 h-3 mr-1" />
                            Print Invoice
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-6 py-4 overflow-x-auto">
                <table className="w-full text-xs min-w-[540px]">
                    <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                            <th className="text-left py-2 pr-3">HSN</th>
                            <th className="text-left py-2 pr-3">Item</th>
                            <th className="text-right py-2 pr-3">Qty</th>
                            <th className="text-right py-2 pr-3">Taxable Value</th>
                            {isInterState ? (
                                <th className="text-right py-2 pr-3">IGST</th>
                            ) : (
                                <>
                                    <th className="text-right py-2 pr-3">CGST</th>
                                    <th className="text-right py-2 pr-3">SGST</th>
                                </>
                            )}
                            <th className="text-right py-2">Total GST</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} className="border-b border-slate-50 text-slate-700">
                                <td className="py-2 pr-3 font-mono text-[10px] text-slate-400">{item.hsnCode || '—'}</td>
                                <td className="py-2 pr-3 font-medium max-w-[140px] truncate">
                                    <span>{item.title}</span>
                                    {item.gstRate !== undefined && (
                                        <span className="ml-1.5 text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">{item.gstRate}%</span>
                                    )}
                                </td>
                                <td className="py-2 pr-3 text-right font-bold">{item.quantity}</td>
                                <td className="py-2 pr-3 text-right">{fmt(item.lineTaxableValue)}</td>
                                {isInterState ? (
                                    <td className="py-2 pr-3 text-right">{fmt(item.lineIgst)}</td>
                                ) : (
                                    <>
                                        <td className="py-2 pr-3 text-right">{fmt(item.lineCgst)}</td>
                                        <td className="py-2 pr-3 text-right">{fmt(item.lineSgst)}</td>
                                    </>
                                )}
                                <td className="py-2 text-right font-bold text-emerald-700">{fmt(item.lineTotalGst)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-200 font-black text-slate-900 text-xs">
                            <td colSpan={3} className="py-3 uppercase tracking-wider text-slate-500">TOTAL</td>
                            <td className="py-3 text-right">{fmt(totals.taxable)}</td>
                            {isInterState ? (
                                <td className="py-3 text-right">{fmt(totals.igst)}</td>
                            ) : (
                                <>
                                    <td className="py-3 text-right">{fmt(totals.cgst)}</td>
                                    <td className="py-3 text-right">{fmt(totals.sgst)}</td>
                                </>
                            )}
                            <td className="py-3 text-right text-emerald-800">{fmt(totals.gst)}</td>
                        </tr>
                    </tfoot>
                </table>
            </CardContent>
        </Card>
    )
}
