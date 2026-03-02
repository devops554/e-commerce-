"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, Truck, AlertTriangle, Loader2 } from "lucide-react"
import { AddressFormValues } from "./AddressForm"
import { purgeInvalidItems } from "@/store/slices/cartSlice"
import { useDispatch } from "react-redux"
import { toast } from "sonner"

interface PaymentMethodStepProps {
    hasInvalidItems: boolean;
    invalidItems: any[];
    address: AddressFormValues | null;
    setStep: (step: "address" | "payment") => void;
    paymentMethod: "razorpay" | "cod";
    setPaymentMethod: (method: "razorpay" | "cod") => void;
    handlePlaceOrder: () => void;
    placingOrder: boolean;
    totalAmount: number;
    itemsCount: number;
}

export function PaymentMethodStep({
    hasInvalidItems,
    invalidItems,
    address,
    setStep,
    paymentMethod,
    setPaymentMethod,
    handlePlaceOrder,
    placingOrder,
    totalAmount,
    itemsCount
}: PaymentMethodStepProps) {
    const dispatch = useDispatch()

    return (
        <section className="space-y-6">
            {/* Invalid Items Warning */}
            {hasInvalidItems && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-amber-800">
                            {invalidItems.length} item(s) in your cart need to be re-added
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            These items were added before a recent update. Remove them and add them again from the product page.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            dispatch(purgeInvalidItems())
                            toast.success("Invalid items removed from cart")
                        }}
                        className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold"
                    >
                        Remove
                    </Button>
                </div>
            )}

            {/* Address Summary Card */}
            <div className="bg-white p-6 border border-slate-200 rounded-[32px] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Shipping To</p>
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{address?.street}, {address?.city}</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep("address")} className="text-primary font-bold hover:bg-primary/5 rounded-full">
                    Change
                </Button>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-[32px] shadow-sm space-y-6">
                <h2 className="text-xl font-black text-slate-900">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${paymentMethod === "razorpay"
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                            : "border-slate-100 hover:border-slate-200"
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${paymentMethod === "razorpay" ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">Online Payment</p>
                            <p className="text-xs text-slate-500 font-medium">Razorpay, Cards, UPI</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setPaymentMethod("cod")}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${paymentMethod === "cod"
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                            : "border-slate-100 hover:border-slate-200"
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${paymentMethod === "cod" ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">Cash on Delivery</p>
                            <p className="text-xs text-slate-500 font-medium">Pay when you receive</p>
                        </div>
                    </button>
                </div>
            </div>

            <div className="mt-8 hidden lg:block">
                <Button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || itemsCount === 0}
                    className="w-full h-16 rounded-3xl text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                >
                    {placingOrder ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        `Place Order • ₹${totalAmount}`
                    )}
                </Button>
            </div>
        </section>
    )
}
