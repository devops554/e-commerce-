"use client"

import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Clock } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import Link from "next/link"

export function CartDrawer() {
    const { items, totalAmount, removeFromCart, incrementQuantity, decrementQuantity } = useCart()

    const totalQty = items.reduce((acc, item) => acc + item.quantity, 0)

    const handleInc = (item: any) => {
        incrementQuantity(item)
    }

    const handleDec = (variantId: string) => {
        decrementQuantity(variantId)
    }

    return (
        <Sheet>
            {/* ── Trigger ── */}
            <SheetTrigger asChild>
                <button className="relative flex items-center gap-2 h-10 px-3.5 bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white rounded-xl text-sm font-bold shadow-sm">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Cart</span>
                    {totalQty > 0 && (
                        <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white text-green-600 text-[10px] font-black">
                            {totalQty}
                        </span>
                    )}
                </button>
            </SheetTrigger>

            {/* ── Drawer ── */}
            <SheetContent
                side="right"
                className="flex flex-col w-full sm:max-w-[390px] p-0 bg-[#f3f3f7] border-l border-gray-200 gap-0"
            >

                {/* ── Header ── */}
                <SheetHeader className="shrink-0 px-4 py-4 bg-white border-b border-gray-100">
                    <SheetTitle className="flex items-center gap-2 text-base font-black text-gray-900">
                        <ShoppingCart className="w-5 h-5 text-green-500" />
                        My Cart
                        {totalQty > 0 && (
                            <span className="ml-1 text-sm font-bold text-gray-400">
                                ({totalQty} {totalQty === 1 ? "item" : "items"})
                            </span>
                        )}
                    </SheetTitle>

                    {/* Delivery eta strip */}
                    {items.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-900">Delivery in <span className="text-green-600">10 minutes</span></p>
                                <p className="text-[10px] text-gray-400 font-medium">Shipment of {totalQty} {totalQty === 1 ? "item" : "items"}</p>
                            </div>
                        </div>
                    )}
                </SheetHeader>

                {/* ── Empty state ── */}
                {items.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                        <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center">
                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                        </div>
                        <div>
                            <p className="text-base font-black text-gray-900">Your cart is empty!</p>
                            <p className="text-xs text-gray-400 font-medium mt-1">
                                Add items to get started
                            </p>
                        </div>
                        <button className="h-11 px-8 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors active:scale-95">
                            Browse Products
                        </button>
                    </div>
                )}

                {/* ── Cart items ── */}
                {items.length > 0 && (
                    <ScrollArea className="flex-1 overflow-hidden">
                        <div className="px-3 py-3 space-y-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                                >
                                    {/* Product image */}
                                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-[#f8f8f8] border border-gray-100">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-contain p-1.5"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2">
                                            {item.title}
                                        </p>
                                        <p className="text-[12px] font-black text-gray-900 mt-1">
                                            ₹{item.price}
                                        </p>
                                    </div>

                                    {/* Right side: stepper + delete */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        {/* delete */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        {/* qty stepper */}
                                        <div className="flex items-center bg-green-500 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => handleDec(item.id)}
                                                className="flex items-center justify-center w-7 h-7 text-white hover:bg-green-600 active:bg-green-700 transition-colors"
                                            >
                                                <Minus className="w-3 h-3 stroke-[3]" />
                                            </button>
                                            <span className="min-w-[20px] text-center text-[12px] font-black text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleInc(item)}
                                                className="flex items-center justify-center w-7 h-7 text-white hover:bg-green-600 active:bg-green-700 transition-colors"
                                            >
                                                <Plus className="w-3 h-3 stroke-[3]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Savings chip ── */}
                        {items.some((i: any) => i.originalPrice && i.originalPrice > i.price) && (
                            <div className="mx-3 mb-2 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
                                <span className="text-green-600 text-xs font-black">🎉 You're saving on this order!</span>
                            </div>
                        )}
                    </ScrollArea>
                )}

                {/* ── Footer bill + checkout ── */}
                {items.length > 0 && (
                    <div className="shrink-0 bg-white border-t border-gray-100 px-4 pt-4 pb-5 space-y-4">

                        {/* Bill summary */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Bill Details
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-medium">Items Total</span>
                                    <span className="text-sm font-bold text-gray-900">₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-medium">Delivery Fee</span>
                                    <span className="text-sm font-bold text-green-600">FREE</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-medium">Handling Fee</span>
                                    <span className="text-sm font-bold text-green-600">FREE</span>
                                </div>
                            </div>
                            <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between items-center">
                                <span className="text-sm font-black text-gray-900">Grand Total</span>
                                <span className="text-lg font-black text-gray-900">₹{totalAmount}</span>
                            </div>
                        </div>

                        {/* Checkout CTA */}
                        <Button
                            asChild
                            className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-[15px] shadow-[0_4px_16px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150"
                        >
                            <Link href="/checkout" className="flex items-center justify-between px-5">
                                <span>Proceed to Checkout</span>
                                <div className="flex items-center gap-1.5 bg-green-600/40 rounded-xl px-2.5 py-1.5">
                                    <span className="font-black text-sm">₹{totalAmount}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Link>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}