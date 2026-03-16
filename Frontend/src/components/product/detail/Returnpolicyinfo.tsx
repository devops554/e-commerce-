"use client"

import React, { useState } from 'react'
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
import {
    RotateCcw, Clock, Banknote, RefreshCw,
    CheckCircle2, XCircle, Camera, Package, AlertTriangle,
    DoorOpen, ChevronRight,
} from 'lucide-react'
import {
    ReturnPolicy, ReturnWindowUnit, ReturnCondition,
    RefundMethod, ExchangeAllowed,
} from '@/services/product.service'

// ─────────────────────────────────────────────
// LABEL MAPS
// ─────────────────────────────────────────────

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
// HELPERS
// ─────────────────────────────────────────────

function Chip({ icon, label, amber }: { icon: React.ReactNode; label: string; amber?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
            ${amber
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
            {icon}{label}
        </span>
    )
}

function Step({ icon, label, sub, isLast }: { icon: React.ReactNode; label: string; sub: string; isLast?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    {icon}
                </div>
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
    return (
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            {children}
        </p>
    )
}

// ─────────────────────────────────────────────
// DRAWER BODY
// ─────────────────────────────────────────────

function DrawerBody({ rp }: { rp: ReturnPolicy }) {
    const windowText = rp.windowValue === 0
        ? 'No return window'
        : `${rp.windowValue} ${rp.windowUnit === ReturnWindowUnit.DAYS
            ? rp.windowValue === 1 ? 'day' : 'days'
            : rp.windowValue === 1 ? 'hour' : 'hours'} return window`

    const hasExchange = rp.exchangeAllowed !== ExchangeAllowed.NO

    return (
        <ScrollArea className="flex-1">
            <div className="px-5 py-5 space-y-6">

                {/* Quick-fact chips */}
                <div className="flex flex-wrap gap-2">
                    <Chip icon={<Clock className="h-3 w-3" />} label={windowText} />
                    {rp.doorstepQcRequired && (
                        <Chip icon={<DoorOpen className="h-3 w-3" />} label="Doorstep pickup" />
                    )}
                    {rp.requiresQcPhoto && (
                        <Chip icon={<Camera className="h-3 w-3" />} label="Photo required" amber />
                    )}
                </div>

                <Separator />

                {/* How to return steps */}
                <div>
                    <SectionLabel>How to return</SectionLabel>
                    <Step
                        icon={<Package className="h-4 w-4" />}
                        label="Request a return"
                        sub="Open the app and raise a return request within the return window."
                    />
                    <Step
                        icon={<RotateCcw className="h-4 w-4" />}
                        label={rp.doorstepQcRequired ? 'Pickup at your door' : 'Drop off at hub'}
                        sub={rp.doorstepQcRequired
                            ? 'A delivery partner visits, inspects the item, and collects it.'
                            : 'Drop the item at your nearest return hub.'}
                    />
                    <Step
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
                                            <span className="text-xs font-semibold text-slate-700">
                                                {refundMethodLabels[m].label}
                                            </span>
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

                {/* Edge case: non-returnable reasons on a returnable product */}
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
                                            <span className="w-1 h-1 rounded-full bg-red-300 shrink-0" />
                                            {r}
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
// MAIN COMPONENT
// ─────────────────────────────────────────────

interface ReturnPolicyInfoProps {
    returnPolicy?: ReturnPolicy
}

export default function ReturnPolicyInfo({ returnPolicy }: ReturnPolicyInfoProps) {
    const [open, setOpen] = useState(false)
    const isReturnable = returnPolicy?.isReturnable ?? false

    return (
        <>
            {/* ── Trigger card ── */}
            {isReturnable ? (
                /* Returnable — clickable green card opens drawer */
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 active:scale-[0.99] transition-all duration-150 text-left group"
                >
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-800 leading-tight">
                            {returnPolicy!.windowValue}{' '}
                            {returnPolicy!.windowUnit === ReturnWindowUnit.DAYS
                                ? returnPolicy!.windowValue === 1 ? 'day' : 'days'
                                : returnPolicy!.windowValue === 1 ? 'hour' : 'hours'}{' '}
                            return window
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                            Tap to see full return &amp; refund policy
                        </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
                </button>
            ) : (
                /* Non-returnable — static card, no Sheet */
                <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3.5">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center">
                            <XCircle className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700">Non-returnable</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                This item cannot be returned once delivered.
                            </p>
                        </div>
                    </div>
                    {returnPolicy?.nonReturnableReasons && returnPolicy.nonReturnableReasons.length > 0 && (
                        <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                            {returnPolicy.nonReturnableReasons.map((r) => (
                                <span key={r} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-500 font-medium">
                                    {r}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── shadcn Sheet drawer — only when returnable ── */}
            {isReturnable && returnPolicy && (
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent
                        side="right"
                        className="w-full sm:w-[420px] p-0 flex flex-col gap-0 [&>button]:hidden"
                    >
                        {/* Drawer header */}
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
                                        {returnPolicy.windowValue}{' '}
                                        {returnPolicy.windowUnit === ReturnWindowUnit.DAYS ? 'days' : 'hours'}{' '}
                                        from delivery date
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
                        <DrawerBody rp={returnPolicy} />
                    </SheetContent>
                </Sheet>
            )}
        </>
    )
}