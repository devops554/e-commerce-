"use client"

import React, { useState } from 'react'
import { ChevronRight, RefreshCcw, Zap, RotateCcw, Clock, Banknote, RefreshCw, CheckCircle2, XCircle, Camera, Package, AlertTriangle, DoorOpen } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetClose,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ReturnPolicy, ExchangeAllowed, ReturnWindowUnit, ReturnCondition, RefundMethod } from '@/services/product.service'

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const offers = [
    { id: 1, logo: 'IDFC', text: 'Flat ₹100 Off with IDFC FIRST Bank Debit Cards' },
    { id: 2, logo: 'Fi', text: 'Get Flat 20% Discount with MagniFi Fi Federal Credit Card' },
    { id: 3, logo: 'Zagg', text: 'Get 20% upto ₹100 off with Zagg Rupay credit card' },
    { id: 4, logo: 'AU', text: "Get 15% off with AU ivy, Eternity, Royale & 'M' circle linked Debit Cards" },
    { id: 5, logo: 'novio', text: 'Get flat ₹100 discount with SBM Credilio RuPay Credit Card' },
]

const conditionLabels: Record<ReturnCondition, { label: string; hint: string }> = {
    [ReturnCondition.UNUSED]: { label: 'Unused', hint: 'Item must not have been used' },
    [ReturnCondition.ORIGINAL_PACKAGING]: { label: 'Original packaging', hint: 'Must be in original box with all accessories' },
    [ReturnCondition.WITH_TAGS]: { label: 'With tags intact', hint: 'All tags and labels must be attached' },
    [ReturnCondition.ANY]: { label: 'Any condition', hint: 'No condition restrictions apply' },
}

const refundMethodLabels: Record<RefundMethod, { label: string; duration: string }> = {
    [RefundMethod.ORIGINAL_SOURCE]: { label: 'Original payment source', duration: '5–7 business days' },
    [RefundMethod.WALLET]: { label: 'Store wallet', duration: 'Instant' },
    [RefundMethod.BANK_TRANSFER]: { label: 'Bank transfer', duration: '3–5 business days' },
}

// ─────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────

function StrikeOverlay() {
    return (
        <svg className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none" viewBox="0 0 96 96">
            <line x1="18" y1="18" x2="78" y2="78" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3" />
        </svg>
    )
}

function Chip({ icon, label, amber }: { icon: React.ReactNode; label: string; amber?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
            ${amber ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            {icon}{label}
        </span>
    )
}

function DrawerStep({ icon, label, sub, isLast }: { icon: React.ReactNode; label: string; sub: string; isLast?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">{icon}</div>
                {!isLast && <div className="w-px h-5 bg-emerald-100 mt-1" />}
            </div>
            <div className="pt-1 pb-3 min-w-0">
                <p className="text-xs font-bold text-slate-700 leading-tight">{label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{sub}</p>
            </div>
        </div>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{children}</p>
}

// ─────────────────────────────────────────────
// DRAWER BODY
// ─────────────────────────────────────────────

function ReturnDrawerBody({ rp }: { rp: ReturnPolicy }) {
    const windowText = rp.windowValue === 0
        ? 'No return window'
        : `${rp.windowValue} ${rp.windowUnit === ReturnWindowUnit.DAYS
            ? rp.windowValue === 1 ? 'day' : 'days'
            : rp.windowValue === 1 ? 'hour' : 'hours'} return window`

    const hasExchange = rp.exchangeAllowed !== ExchangeAllowed.NO

    return (
        <ScrollArea className="flex-1 h-full">
            <div className="px-5 py-5 space-y-6">

                {/* Quick chips */}
                <div className="flex flex-wrap gap-2">
                    <Chip icon={<Clock className="h-3 w-3" />} label={windowText} />
                    {rp.doorstepQcRequired && <Chip icon={<DoorOpen className="h-3 w-3" />} label="Doorstep pickup" />}
                    {rp.requiresQcPhoto && <Chip icon={<Camera className="h-3 w-3" />} label="Photo required" amber />}
                </div>

                <Separator />

                {/* Steps */}
                <div>
                    <SectionLabel>How to return</SectionLabel>
                    <DrawerStep
                        icon={<Package className="h-4 w-4" />}
                        label="Request a return"
                        sub="Open the app and raise a return request within the return window."
                    />
                    <DrawerStep
                        icon={<RotateCcw className="h-4 w-4" />}
                        label={rp.doorstepQcRequired ? 'Pickup at your door' : 'Drop off at hub'}
                        sub={rp.doorstepQcRequired
                            ? 'A delivery partner visits, inspects the item, and collects it.'
                            : 'Drop the item at your nearest return hub.'}
                    />
                    <DrawerStep
                        icon={<Banknote className="h-4 w-4" />}
                        label="Refund processed"
                        sub="Refund is issued to your selected method after QC passes."
                        isLast
                    />
                </div>

                {/* Conditions */}
                {rp.conditions.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <SectionLabel>Item must be</SectionLabel>
                            <div className="space-y-2.5">
                                {rp.conditions.map((c) => (
                                    <div key={c} className="flex items-start gap-2.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                        <div className="text-xs leading-snug">
                                            <span className="font-semibold text-slate-700">{conditionLabels[c].label}</span>
                                            <span className="text-slate-400"> — {conditionLabels[c].hint}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Refund methods */}
                {rp.refundMethods.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <SectionLabel>Refund options</SectionLabel>
                            <div className="space-y-2">
                                {rp.refundMethods.map((m) => (
                                    <div key={m} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="text-xs font-semibold text-slate-700">{refundMethodLabels[m].label}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                            {refundMethodLabels[m].duration}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Exchange */}
                {hasExchange && (
                    <>
                        <Separator />
                        <div className="flex items-start gap-2.5 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3">
                            <RefreshCw className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-violet-700 leading-relaxed">
                                <span className="font-bold">Exchange available</span>
                                {rp.exchangeAllowed === ExchangeAllowed.SIZE_ONLY
                                    ? ' — size exchanges only. Select the correct size when requesting.'
                                    : ' — full exchange on any eligible variant.'}
                            </p>
                        </div>
                    </>
                )}

                {/* Non-returnable edge cases */}
                {rp.nonReturnableReasons.length > 0 && (
                    <>
                        <Separator />
                        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-red-600 mb-1.5">Not applicable when</p>
                                <ul className="space-y-1">
                                    {rp.nonReturnableReasons.map((r) => (
                                        <li key={r} className="flex items-center gap-1.5 text-xs text-red-500">
                                            <span className="w-1 h-1 rounded-full bg-red-300 shrink-0" />{r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )}

                {/* Fine print */}
                <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                    Return window starts from the date of delivery. Items that fail quality check at
                    pickup will be sent back to you with no refund issued.
                </p>
            </div>
        </ScrollArea>
    )
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

interface OffersSectionProps {
    returnPolicy?: ReturnPolicy
}

const OffersSection = ({ returnPolicy }: OffersSectionProps) => {
    const [drawerOpen, setDrawerOpen] = useState(false)

    const isReturnable = returnPolicy?.isReturnable ?? false
    const hasExchange = isReturnable && returnPolicy?.exchangeAllowed !== ExchangeAllowed.NO

    const returnLabel = isReturnable
        ? `${returnPolicy!.windowValue} ${returnPolicy!.windowValue === 1 ? 'Day' : 'Days'} Return`
        : 'No Returns'

    const exchangeLabel = hasExchange
        ? returnPolicy?.exchangeAllowed === ExchangeAllowed.SIZE_ONLY ? 'Size Exchange' : 'Easy Exchange'
        : 'No Exchange'

    const windowDisplay = isReturnable && returnPolicy
        ? `${returnPolicy.windowValue} ${returnPolicy.windowUnit === ReturnWindowUnit.DAYS ? 'days' : 'hours'}`
        : null

    return (
        <div className="max-w-md p-4 bg-white font-sans text-slate-800">

            {/* Top Highlight Banner */}
            <div className="flex items-center justify-between p-3 mb-6 border border-indigo-50 rounded-xl bg-indigo-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-red-700 rounded flex items-center justify-center text-[8px] text-white font-bold leading-tight px-1">
                        IDFC FIRST Bank
                    </div>
                    <div className="text-sm">
                        Get at <span className="font-bold">₹568</span> with coupon offers
                        <div className="text-pink-600 font-semibold text-xs cursor-pointer">View all offers</div>
                    </div>
                </div>
                <ChevronRight size={18} className="text-pink-600" />
            </div>

            {/* Coupons Header */}
            <div className="relative mb-4">
                <h2 className="text-lg font-bold text-slate-700 bg-white pr-4 inline-block relative z-10">
                    Coupons & Offers
                </h2>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -z-0" />
            </div>

            {/* Offers List */}
            <div className="space-y-5 mb-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border border-slate-100 rounded-lg flex items-center justify-center bg-white overflow-hidden shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{offer.logo}</span>
                            </div>
                            <p className="text-[13px] leading-snug font-medium text-slate-600 pr-2">{offer.text}</p>
                        </div>
                        <ChevronRight size={16} className="text-pink-500 shrink-0 opacity-70 group-hover:opacity-100" />
                    </div>
                ))}
            </div>

            <button className="text-pink-600 font-bold text-sm mb-8 block hover:underline">
                View all coupons
            </button>

            <hr className="border-slate-100 mb-6" />

            {/* ── Policy Badges ── */}
            <div className="flex gap-3 mb-6">

                {/* Return badge — clickable when returnable, opens drawer */}
                <button
                    type="button"
                    onClick={() => isReturnable && setDrawerOpen(true)}
                    disabled={!isReturnable}
                    className={`
                        relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border
                        transition-all duration-200
                        ${isReturnable
                            ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm hover:scale-[1.03] cursor-pointer active:scale-[0.98]'
                            : 'bg-slate-50 border-slate-100 cursor-default'
                        }
                    `}
                >
                    {!isReturnable && <StrikeOverlay />}
                    <RotateCcw size={26} className={`mb-1.5 ${isReturnable ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className={`text-[10px] font-bold text-center px-1.5 leading-tight ${isReturnable ? 'text-emerald-700' : 'text-slate-300'}`}>
                        {returnLabel}
                    </span>
                    {/* Tap hint dot */}
                    {isReturnable && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                </button>

                {/* Exchange badge — static, no drawer */}
                <div className={`
                    relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border
                    transition-all duration-200
                    ${hasExchange ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}
                `}>
                    {!hasExchange && <StrikeOverlay />}
                    <RefreshCcw size={26} className={`mb-1.5 ${hasExchange ? 'text-blue-500' : 'text-slate-300'}`} />
                    <span className={`text-[10px] font-bold text-center px-1.5 leading-tight ${hasExchange ? 'text-blue-700' : 'text-slate-300'}`}>
                        {exchangeLabel}
                    </span>
                </div>

                {/* Fast Delivery — always static */}
                <div className="flex flex-col items-center justify-center w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100">
                    <Zap size={26} className="text-slate-600 mb-1.5" />
                    <span className="text-[10px] font-bold text-slate-700 text-center px-1.5 leading-tight">Fast Delivery</span>
                </div>

            </div>

            {/* ── Return Policy Sheet Drawer ── */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:w-[420px] p-0 flex flex-col gap-0 [&>button]:hidden"
                >
                    {/* Header */}
                    <SheetHeader className="px-5 py-4 border-b border-emerald-100 bg-emerald-50/60 shrink-0 space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <RotateCcw className="h-4 w-4 text-emerald-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <SheetTitle className="text-sm font-black text-emerald-900 leading-tight">
                                    Return &amp; refund policy
                                </SheetTitle>
                                <SheetDescription className="text-xs text-emerald-600 mt-0.5 font-medium">
                                    {windowDisplay} from delivery date
                                </SheetDescription>
                            </div>
                            <SheetClose asChild>
                                <button
                                    type="button"
                                    className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors text-emerald-500 text-sm font-bold"
                                >
                                    ✕
                                </button>
                            </SheetClose>
                        </div>
                    </SheetHeader>

                    {/* Scrollable body */}
                    {isReturnable && returnPolicy && <ReturnDrawerBody rp={returnPolicy} />}
                </SheetContent>
            </Sheet>

        </div>
    )
}

export default OffersSection