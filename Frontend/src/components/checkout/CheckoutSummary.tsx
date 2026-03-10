"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getOrderItemGst, calculateOrderTotals } from "@/utils/gst"

interface CartItem {
    id: string
    title: string
    price: number
    quantity: number
    image: string
    gstRate?: number
    hsnCode?: string
}

interface CheckoutSummaryProps {
    items: CartItem[]
    totalAmount: number
}

export function CheckoutSummary({ items, totalAmount }: CheckoutSummaryProps) {
    const shipping = 0 // Free delivery
    const finalAmount = totalAmount + shipping

    return (
        <Card className="border-slate-200 rounded-[32px] overflow-hidden shadow-sm sticky top-24">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Order Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <ScrollArea className="h-[380px] -mx-2 px-2 mb-6">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="group flex gap-3 p-2.5 rounded-xl bg-white border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                                    <Image src={item.image} alt={item.title} fill className="object-contain p-2" />
                                </div>
                                <div className="flex flex-1 flex-col justify-center">
                                    <h4 className="line-clamp-1 text-xs font-bold text-slate-900 leading-tight tracking-tight group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex flex-col">
                                        <span>Qty: {item.quantity} × ₹{item.price}</span>
                                        {item.gstRate && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                Incl. ₹{getOrderItemGst(item.price, item.gstRate, item.quantity).gstAmount} GST @{item.gstRate}%
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-sm font-bold text-slate-900 flex items-center pr-1">
                                    ₹{item.price * item.quantity}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {(() => {
                        const { subTotal, totalGst } = calculateOrderTotals(items);
                        return (
                            <>
                                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>Subtotal (Taxable Value)</span>
                                    <span className="text-slate-900">₹{subTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>GST Total</span>
                                    <span className="text-slate-900">₹{totalGst.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-600 font-bold">FREE</span>
                                </div>
                                <Separator className="bg-slate-200/40" />
                                <div className="flex justify-between items-center pt-0.5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">Total Amount</span>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight italic">GST Included in price</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-primary tracking-tight">₹{finalAmount.toLocaleString('en-IN')}</span>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Total Payable</p>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </CardContent>
        </Card>
    )
}
