"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order.service'
import { Loader2, AlertCircle, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    if (num === 0) return 'Zero'
    const toWords = (n: number): string => {
        if (n < 20) return ones[n]
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '')
        if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '')
        if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '')
        return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '')
    }
    const rupees = Math.floor(num)
    const paise = Math.round((num - rupees) * 100)
    let result = 'Rupees ' + toWords(rupees)
    if (paise > 0) result += ' and ' + toWords(paise) + ' Paise'
    return result + ' Only'
}

const fmt = (n?: number) =>
    n !== undefined ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

export default function InvoicePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: invoice, isLoading, error } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => orderService.getInvoice(id),
        enabled: !!id,
    })

    if (isLoading) return (
        <div className="flex items-center justify-center py-40 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-slate-500">Loading invoice…</p>
        </div>
    )

    if (error || !invoice) return (
        <div className="flex flex-col items-center justify-center py-40 gap-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm font-bold text-rose-600">Could not load invoice.</p>
            <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl">Go back</Button>
        </div>
    )

    const { seller, buyer, invoice: inv, items, totals, isInterState } = invoice
    const halfRate = (item: any) => item.gstRate / 2

    return (
        <div>
            {/* ── No-print toolbar ── */}
            <div className="print:hidden flex items-center gap-3 mb-6">
                <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl">← Back</Button>
                <Button
                    size="sm"
                    className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-100"
                    onClick={() => window.print()}
                >
                    <Printer className="w-4 h-4 mr-2" /> Print Invoice
                </Button>
            </div>

            {/* ── A4 Invoice ── */}
            <div id="invoice-print" className="bg-white max-w-[860px] mx-auto shadow-xl border border-slate-200 rounded-2xl print:shadow-none print:border-none print:rounded-none p-10 space-y-6 text-sm font-sans">

                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">TAX INVOICE</h1>
                        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">Computer Generated</p>
                    </div>
                    <div className="text-right text-xs space-y-1">
                        <p><span className="font-bold text-slate-500">Invoice No:</span> <span className="font-black text-slate-900">{inv.invoiceNumber || '—'}</span></p>
                        <p><span className="font-bold text-slate-500">Invoice Date:</span> {inv.invoiceDate ? format(new Date(inv.invoiceDate), 'dd MMM yyyy') : '—'}</p>
                        <p><span className="font-bold text-slate-500">Order ID:</span> {inv.orderId}</p>
                    </div>
                </div>

                {/* Seller & Buyer */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Seller / Supplier</p>
                        <p className="font-black text-slate-900">{seller.legalName}</p>
                        <p className="text-slate-600">{seller.address}</p>
                        <p className="text-slate-600">GSTIN: <span className="font-mono font-bold">{seller.gstin || 'N/A'}</span></p>
                        {seller.email && <p className="text-slate-500">{seller.email}</p>}
                        {seller.phone && <p className="text-slate-500">{seller.phone}</p>}
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Bill To / Ship To</p>
                        <p className="font-black text-slate-900">{buyer.fullName}</p>
                        <p className="text-slate-600">{buyer.address?.street}</p>
                        <p className="text-slate-600">{buyer.address?.city}, {buyer.address?.state} - {buyer.address?.postalCode}</p>
                        <p className="text-slate-600">{buyer.address?.country}</p>
                        <p className="text-slate-500">Ph: {buyer.phone}</p>
                    </div>
                </div>

                {/* Tax type badge */}
                <div className="flex">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isInterState ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                        {isInterState ? 'Inter-State Supply — IGST Applicable' : 'Intra-State Supply — CGST + SGST Applicable'}
                    </span>
                </div>

                {/* Items table */}
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="text-left px-3 py-2.5 rounded-tl-lg">#</th>
                            <th className="text-left px-3 py-2.5">Item Description</th>
                            <th className="text-center px-3 py-2.5">HSN</th>
                            <th className="text-center px-3 py-2.5">Qty</th>
                            <th className="text-right px-3 py-2.5">Taxable Value</th>
                            {isInterState ? (
                                <th className="text-right px-3 py-2.5">IGST</th>
                            ) : (
                                <>
                                    <th className="text-right px-3 py-2.5">CGST</th>
                                    <th className="text-right px-3 py-2.5">SGST</th>
                                </>
                            )}
                            <th className="text-right px-3 py-2.5 rounded-tr-lg">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-slate-100">
                                <td className="px-3 py-2.5 text-slate-400">{i + 1}</td>
                                <td className="px-3 py-2.5 font-medium text-slate-800">{item.title}</td>
                                <td className="px-3 py-2.5 text-center font-mono text-slate-500">{item.hsnCode}</td>
                                <td className="px-3 py-2.5 text-center font-bold">{item.quantity}</td>
                                <td className="px-3 py-2.5 text-right">₹{fmt(item.lineTaxableValue)}</td>
                                {isInterState ? (
                                    <td className="px-3 py-2.5 text-right">
                                        <span className="text-[9px] text-slate-400 mr-1">{item.gstRate}%</span>
                                        ₹{fmt(item.lineIgst)}
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-3 py-2.5 text-right">
                                            <span className="text-[9px] text-slate-400 mr-1">{halfRate(item)}%</span>
                                            ₹{fmt(item.lineCgst)}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <span className="text-[9px] text-slate-400 mr-1">{halfRate(item)}%</span>
                                            ₹{fmt(item.lineSgst)}
                                        </td>
                                    </>
                                )}
                                <td className="px-3 py-2.5 text-right font-bold text-slate-900">₹{fmt(item.lineTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-72 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Taxable Value (Sub-Total)</span>
                            <span className="font-bold">₹{fmt(totals.subTotal)}</span>
                        </div>
                        {isInterState ? (
                            <div className="flex justify-between text-slate-600">
                                <span>IGST</span>
                                <span className="font-bold">₹{fmt(totals.totalIgst)}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between text-slate-600">
                                    <span>CGST</span>
                                    <span className="font-bold">₹{fmt(totals.totalCgst)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>SGST</span>
                                    <span className="font-bold">₹{fmt(totals.totalSgst)}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between text-slate-600">
                            <span>Total GST</span>
                            <span className="font-bold">₹{fmt(totals.totalGstAmount)}</span>
                        </div>
                        {totals.shippingCharge > 0 && (
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping</span>
                                <span className="font-bold">₹{fmt(totals.shippingCharge)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-black text-base text-slate-900 border-t-2 border-slate-900 pt-2 mt-2">
                            <span>Grand Total</span>
                            <span>₹{fmt(totals.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Amount in words */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider mr-2">Amount in Words:</span>
                    <span className="font-bold text-slate-800">{numberToWords(totals.totalAmount)}</span>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>GSTIN of Supplier: <span className="font-mono font-bold text-slate-600">{seller.gstin || 'N/A'}</span></span>
                    <span className="italic">This is a computer generated invoice and does not require a signature.</span>
                </div>
            </div>

            {/* Global print styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-print, #invoice-print * { visibility: visible; }
                    #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    )
}
