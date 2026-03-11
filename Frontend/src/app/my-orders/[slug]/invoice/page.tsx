"use client";


import { useInvoice } from '@/hooks/useInvoice'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, Printer, ArrowLeft, Download } from 'lucide-react'
import { format } from 'date-fns'
import { useRef, useState } from 'react'

export default function CustomerInvoicePage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.slug as string
    const { data: invoiceData, isLoading, error } = useInvoice(orderId)
    const [downloading, setDownloading] = useState(false)
    const invoiceRef = useRef<HTMLDivElement>(null)

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating invoice...</p>
            </div>
        )
    }

    if (error || !invoiceData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm font-medium">Invoice not found or could not be loaded.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const { seller, buyer, invoice, items, totals, isInterState } = invoiceData

    const printInvoice = () => {
        window.print()
    }

    const downloadPDF = () => {
        setDownloading(true)
        try {
            const invoiceElement = invoiceRef.current!
            const printWindow = window.open('', '_blank')!

            const styles = Array.from(document.styleSheets)
                .map((sheet) => {
                    try {
                        return Array.from(sheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join('\n')
                    } catch {
                        return ''
                    }
                })
                .join('\n')

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8" />
                        <title>Invoice-${invoice.invoiceNumber}</title>
                        <style>
                            ${styles}
                            @page { margin: 10mm; size: A4; }
                            body { background: white !important; margin: 0; padding: 0; }
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            .rounded-\\[40px\\] { border-radius: 0 !important; }
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
        } catch (err) {
            console.error('PDF download failed:', err)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
            {/* Header / Controls — hidden on print */}
            <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Order
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={downloadPDF}
                        disabled={downloading}
                        className="rounded-xl border-slate-200"
                    >
                        {downloading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        {downloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                    <Button onClick={printInvoice} className="rounded-xl shadow-lg bg-primary hover:bg-primary/90">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Bill
                    </Button>
                </div>
            </div>

            {/* Invoice Container */}
            <div
                ref={invoiceRef}
                className="max-w-5xl mx-auto bg-white shadow-xl rounded-[40px] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none printable-invoice"
            >
                {/* Invoice Header */}
                <div className="px-6 sm:px-12 py-8 sm:py-10 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row justify-between gap-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3 uppercase">Tax Invoice</h1>
                            <p className="text-sm text-slate-500 font-mono">Invoice No: {invoice.invoiceNumber}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Date: {format(new Date(invoice.invoiceDate), 'PPP')}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 font-mono">Order ID: #{invoice.orderId}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <h2 className="text-xl font-black text-primary uppercase tracking-wider">{seller.legalName}</h2>
                            <p className="text-xs text-slate-500 max-w-[260px] sm:ml-auto mt-2 leading-relaxed">
                                {seller.address}<br />
                                GSTIN: <span className="font-bold text-slate-700">{seller.gstin}</span><br />
                                State Code: {seller.stateCode}<br />
                                Email: {seller.email}<br />
                                Phone: {seller.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Billing Details */}
                <div className="px-6 sm:px-12 py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a09070] mb-4">Billed To</p>
                        <h3 className="font-bold text-slate-900 text-lg">{buyer.fullName}</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            {buyer.address.street}<br />
                            {buyer.address.landmark ? `Near ${buyer.address.landmark}, ` : ''}
                            {buyer.address.city}, {buyer.address.state}<br />
                            {buyer.address.postalCode}, {buyer.address.country}
                        </p>
                        <p className="text-sm font-bold text-slate-700 mt-3">{buyer.phone}</p>
                        {buyer.gstin && (
                            <p className="text-xs text-slate-500 mt-2">GSTIN: {buyer.gstin}</p>
                        )}
                    </div>
                    <div className="sm:text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a09070] mb-4">Invoice Summary</p>
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500">Invoice Type: <span className="font-bold text-slate-700">GST Invoice</span></p>
                            <p className="text-xs text-slate-500">Transaction: <span className="font-bold text-slate-700">{isInterState ? 'Inter-state' : 'Intra-state'}</span></p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="px-6 sm:px-12 py-6 sm:py-8 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 rounded-xl">
                                <th className="py-4 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-l-xl" colSpan={2}>
                                    Description
                                </th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center whitespace-nowrap">
                                    HSN
                                </th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                                    Qty
                                </th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right whitespace-nowrap">
                                    Unit Price
                                </th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right whitespace-nowrap">
                                    Base Value
                                </th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right whitespace-nowrap">
                                    GST %
                                </th>
                                <th className="py-4 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right rounded-r-xl whitespace-nowrap">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                                >
                                    {/* Product Image */}
                                    <td className="py-6 pl-4 pr-3 w-16">
                                        {item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-14 h-14 object-cover rounded-xl border border-slate-100 product-img"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase">
                                                N/A
                                            </div>
                                        )}
                                    </td>

                                    {/* Description */}
                                    <td className="py-6 pr-6">
                                        <p className="text-sm font-bold text-slate-900 leading-snug">{item.title}</p>
                                        <div className="flex flex-col gap-1 mt-1.5">
                                            {item.sku && (
                                                <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                                            )}
                                            {item.attributes && item.attributes.length > 0 && (
                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                                    {item.attributes.map((attr, idx) => (
                                                        <span key={idx} className="text-[10px] text-slate-400">
                                                            <span className="font-semibold text-slate-500">{attr.name}:</span> {attr.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-6 px-4 text-sm text-center text-slate-500 font-mono whitespace-nowrap">
                                        {item.hsnCode || '-'}
                                    </td>
                                    <td className="py-6 px-4 text-sm text-center text-slate-900 font-bold">
                                        {item.quantity}
                                    </td>
                                    <td className="py-6 px-4 text-sm text-right text-slate-900 font-medium whitespace-nowrap">
                                        ₹{item.unitPrice.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-6 px-4 text-sm text-right text-slate-500 whitespace-nowrap">
                                        ₹{item.lineTaxableValue.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-6 px-6 text-sm text-right text-slate-500 whitespace-nowrap">
                                        {item.gstRate}%
                                    </td>
                                    <td className="py-6 pr-4 text-sm text-right text-slate-900 font-bold whitespace-nowrap">
                                        ₹{item.lineTotal.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Divider */}
                <div className="mx-12 border-t border-dashed border-slate-200" />

                {/* Invoice Footer / Totals */}
                <div className="px-6 sm:px-12 py-8 sm:py-10 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-10">
                    {/* Tax Breakdown */}
                    <div className="max-w-xs space-y-5">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#a09070] mb-3">Tax Breakdown</p>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] text-slate-500">
                                {!isInterState ? (
                                    <>
                                        <span>CGST Total:</span>
                                        <span className="font-bold text-slate-700">₹{totals.totalCgst.toLocaleString('en-IN')}</span>
                                        <span>SGST Total:</span>
                                        <span className="font-bold text-slate-700">₹{totals.totalSgst.toLocaleString('en-IN')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>IGST Total:</span>
                                        <span className="font-bold text-slate-700">₹{totals.totalIgst.toLocaleString('en-IN')}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            All prices listed above are inclusive of Goods and Services Tax (GST). This is a system-generated invoice and does not require a physical signature.
                        </p>
                    </div>

                    {/* Totals */}
                    <div className="w-full sm:w-80 space-y-3">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500 font-medium uppercase tracking-tighter text-xs">Total Taxable Value</span>
                            <span className="text-slate-900 font-bold">₹{totals.subTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500 font-medium uppercase tracking-tighter text-xs">Total Tax (GST)</span>
                            <span className="text-slate-900 font-bold">₹{totals.totalGstAmount.toLocaleString('en-IN')}</span>
                        </div>
                        {totals.shippingCharge > 0 && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-500 font-medium uppercase tracking-tighter text-xs">Shipping Charges</span>
                                <span className="text-slate-900 font-bold">₹{totals.shippingCharge.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-4 px-5 mt-2 bg-slate-900 rounded-2xl">
                            <span className="text-white font-black uppercase text-xs tracking-wide">Grand Total</span>
                            <span className="text-xl font-black text-white tracking-tight">₹{totals.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[10px] text-right text-slate-400 font-medium uppercase tracking-widest pt-1">
                            Amount in words: <span className="italic">N/A</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer — hidden on print */}
            <p className="text-center text-[10px] text-slate-400 mt-10 uppercase tracking-widest print:hidden">
                Thank you for shopping with us!
            </p>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    body * { visibility: hidden; }
                    .printable-invoice,
                    .printable-invoice * { visibility: visible; }
                    .printable-invoice {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        box-shadow: none !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 0 !important;
                    }
                    .bg-slate-50\/50 {
                        background-color: #f8fafc !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .bg-slate-900 {
                        background-color: #0f172a !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .product-img {
                        width: 44px !important;
                        height: 44px !important;
                        object-fit: cover !important;
                        border-radius: 8px !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    )
}