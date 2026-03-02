"use client"

import { AddressFormValues } from "./AddressForm"

interface CheckoutStepIndicatorProps {
    step: "address" | "payment";
    setStep: (step: "address" | "payment") => void;
    address: AddressFormValues | null;
}

export function CheckoutStepIndicator({ step, setStep, address }: CheckoutStepIndicatorProps) {
    return (
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm self-start md:self-auto">
            <button
                onClick={() => setStep("address")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${step === "address" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
            >
                1. Address
            </button>
            <button
                onClick={() => address && setStep("payment")}
                disabled={!address}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${step === "payment" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 disabled:opacity-30"}`}
            >
                2. Payment
            </button>
        </div>
    )
}
