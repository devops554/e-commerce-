"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/order.service'
import { Loader2, AlertCircle, Printer, ArrowLeft, Download } from 'lucide-react'
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

export default function ManagerInvoicePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: invoice, isLoading, error } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => orderService.getPackingSlip(id),
        enabled: !!id,
    })

    if (isLoading) return (
        <div className="flex items-center justify-center py-40 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            <p className="text-sm text-slate-400">Loading invoice...</p>
        </div>
    )

    if (error || !invoice) return (
        <div className="flex flex-col items-center justify-center py-40 gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-slate-500">Could not load invoice.</p>
            <Button variant="outline" size="sm" onClick={() => router.back()}>Go Back</Button>
        </div>
    )

    const { seller, buyer, invoice: inv, items, totals, isInterState } = invoice
    const halfRate = (item: any) => item.gstRate / 2

    const handleDownload = () => {
        const invoiceElement = document.getElementById('invoice-print')!
        const printWindow = window.open('', '_blank')!
        const styles = Array.from(document.styleSheets)
            .map((sheet) => {
                try {
                    return Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n')
                } catch { return '' }
            })
            .join('\n')
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8"/>
                    <title>Invoice-${inv.invoiceNumber}</title>
                    <style>
                        ${styles}
                        @page { margin: 12mm; size: A4; }
                        body { background: white !important; margin: 0; padding: 32px; font-family: sans-serif; }
                        img { max-width: 100%; }
                    </style>
                </head>
                <body>
                    ${invoiceElement.outerHTML}
                    <script>
                        window.onload = function() {
                            window.print()
                            window.onafterprint = function() { window.close() }
                        }
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">

            {/* Toolbar */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="border-gray-200 text-gray-700 hover:bg-gray-100"
                    >
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => window.print()}
                        className="bg-slate-800 hover:bg-slate-900 text-white"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                </div>
            </div>

            {/* Invoice */}
            <div
                id="invoice-print"
                className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-10 print:border-none print:rounded-none print:shadow-none print:p-8"
            >

                {/* Top: Company + Invoice Info */}
                <div className="flex justify-between items-start pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{seller.legalName}</h1>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">{seller.address}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            GSTIN: <span className="font-semibold text-gray-700">{seller.gstin}</span>
                        </p>
                        {seller.email && <p className="text-xs text-gray-500 mt-0.5">{seller.email}</p>}
                        {seller.phone && <p className="text-xs text-gray-500">{seller.phone}</p>}
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tax Invoice</p>
                        <p className="text-xs text-gray-500">
                            Invoice No: <span className="font-semibold text-gray-800">{inv.invoiceNumber || '—'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Date: <span className="font-semibold text-gray-800">
                                {inv.invoiceDate ? format(new Date(inv.invoiceDate), 'dd MMM yyyy') : '—'}
                            </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Order: <span className="font-mono text-gray-700">#{inv.orderId}</span>
                        </p>
                    </div>
                </div>

                {/* Buyer Info */}
                <div className="py-6 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
                    <p className="text-sm font-semibold text-gray-900">{buyer.fullName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {buyer.address?.street}, {buyer.address?.city}, {buyer.address?.state} — {buyer.address?.postalCode}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{buyer.phone}</p>
                    {buyer.gstin && (
                        <p className="text-xs text-gray-500 mt-0.5">GSTIN: {buyer.gstin}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {isInterState ? 'Inter-State Supply (IGST)' : 'Intra-State Supply (CGST + SGST)'}
                    </p>
                </div>

                {/* Items Table */}
                <div className="mt-6">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b-2 border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                                <th className="pb-3 text-left w-6">#</th>
                                <th className="pb-3 text-left">Item</th>
                                <th className="pb-3 text-center">HSN</th>
                                <th className="pb-3 text-center">Qty</th>
                                <th className="pb-3 text-right">Taxable</th>
                                {isInterState ? (
                                    <th className="pb-3 text-right">IGST</th>
                                ) : (
                                    <>
                                        <th className="pb-3 text-right">CGST</th>
                                        <th className="pb-3 text-right">SGST</th>
                                    </>
                                )}
                                <th className="pb-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item: any, i: number) => (
                                <tr key={i} className="text-gray-700">
                                    <td className="py-4 text-gray-400">{i + 1}</td>
                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-3">
                                            {item.thumbnail && (
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    className="w-9 h-9 rounded-md object-cover border border-gray-100 shrink-0 print:hidden"
                                                />
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 leading-snug">{item.title}</p>
                                                {item.sku && (
                                                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">SKU: {item.sku}</p>
                                                )}
                                                {item.attributes?.length > 0 && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {item.attributes.map((a: any) => `${a.name}: ${a.value}`).join(' · ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center font-mono text-gray-400">{item.hsnCode || '—'}</td>
                                    <td className="py-4 text-center font-semibold text-gray-900">{item.quantity}</td>
                                    <td className="py-4 text-right text-gray-600">₹{fmt(item.lineTaxableValue)}</td>
                                    {isInterState ? (
                                        <td className="py-4 text-right">
                                            <span className="text-gray-700">₹{fmt(item.lineIgst)}</span>
                                            <span className="block text-[9px] text-gray-400">@{item.gstRate}%</span>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="py-4 text-right">
                                                <span className="text-gray-700">₹{fmt(item.lineCgst)}</span>
                                                <span className="block text-[9px] text-gray-400">@{halfRate(item)}%</span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="text-gray-700">₹{fmt(item.lineSgst)}</span>
                                                <span className="block text-[9px] text-gray-400">@{halfRate(item)}%</span>
                                            </td>
                                        </>
                                    )}
                                    <td className="py-4 text-right font-bold text-gray-900">₹{fmt(item.lineTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                    <div className="w-56 space-y-2 text-xs">
                        <div className="flex justify-between text-gray-500">
                            <span>Taxable Value</span>
                            <span className="font-medium text-gray-800">₹{fmt(totals.subTotal)}</span>
                        </div>
                        {isInterState ? (
                            <div className="flex justify-between text-gray-500">
                                <span>IGST</span>
                                <span className="font-medium text-gray-800">₹{fmt(totals.totalIgst)}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between text-gray-500">
                                    <span>CGST</span>
                                    <span className="font-medium text-gray-800">₹{fmt(totals.totalCgst)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>SGST</span>
                                    <span className="font-medium text-gray-800">₹{fmt(totals.totalSgst)}</span>
                                </div>
                            </>
                        )}
                        {totals.shippingCharge > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span className="font-medium text-gray-800">₹{fmt(totals.shippingCharge)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-3 border-t-2 border-gray-900 text-sm font-bold text-gray-900">
                            <span>Grand Total</span>
                            <span>₹{fmt(totals.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Amount in words */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Amount in Words</p>
                    <p className="text-xs text-gray-600 italic">{numberToWords(totals.totalAmount)}</p>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-end">
                    <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
                        This is a computer-generated invoice and does not require a physical signature.
                    </p>
                    <div className="text-right">
                        <div className="h-8 border-b border-dashed border-gray-300 w-32 mb-1" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Authorised Signatory</p>
                    </div>
                </div>

            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 12mm; size: A4 portrait; }
                    body { background: white !important; }
                    body * { visibility: hidden; }
                    #invoice-print, #invoice-print * { visibility: visible; }
                    #invoice-print {
                        position: absolute;
                        left: 0; top: 0;
                        width: 100%;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 32px !important;
                    }
                }
            `}</style>
        </div>
    )
}