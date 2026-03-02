"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface CheckoutMobileBarProps {
    step: "address" | "payment";
    handlePlaceOrder: () => void;
    placingOrder: boolean;
    itemsCount: number;
    totalAmount: number;
}

export function CheckoutMobileBar({
    step,
    handlePlaceOrder,
    placingOrder,
    itemsCount,
    totalAmount
}: CheckoutMobileBarProps) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
            {step === "address" ? (
                <Button
                    form="address-form"
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200"
                >
                    Save Address & Continue
                </Button>
            ) : (
                <Button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || itemsCount === 0}
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200"
                >
                    {placingOrder ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        `Complete Payment • ₹${totalAmount}`
                    )}
                </Button>
            )}
        </div>
    )
}
