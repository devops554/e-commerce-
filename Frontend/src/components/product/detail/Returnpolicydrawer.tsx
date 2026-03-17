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
    CheckCircle2, XCircle, Camera, Package,
    AlertTriangle, DoorOpen, ChevronRight,
} from 'lucide-react'
import {
    ReturnPolicy,
    ReturnWindowUnit,
    ReturnCondition,
    RefundMethod,
    ExchangeAllowed,
} from '@/services/product.service'

// ─────────────────────────────────────────────
// LABEL + EMOJI MAPS
// ─────────────────────────────────────────────

const conditionLabels: Record<ReturnCondition, { label: string; hint: string; emoji: string }> = {
    [ReturnCondition.UNUSED]: { label: 'Unused', hint: 'Item must not have been used', emoji: '🆕' },
    [ReturnCondition.ORIGINAL_PACKAGING]: { label: 'Original packaging', hint: 'Must be in original box with all accessories', emoji: '📦' },
    [ReturnCondition.WITH_TAGS]: { label: 'With tags intact', hint: 'All tags and labels must be attached', emoji: '🏷️' },
    [ReturnCondition.ANY]: { label: 'Any condition', hint: 'No condition restrictions apply', emoji: '✅' },
}

const refundMethodLabels: Record<RefundMethod, { label: string; duration: string; emoji: string; color: string }> = {
    [RefundMethod.ORIGINAL_SOURCE]: { label: 'Original payment source', duration: '5–7 business days', emoji: '💳', color: 'bg-blue-50 border-blue-100' },
    [RefundMethod.WALLET]: { label: 'Store wallet', duration: 'Instant', emoji: '⚡', color: 'bg-violet-50 border-violet-100' },
    [RefundMethod.BANK_TRANSFER]: { label: 'Bank transfer', duration: '3–5 business days', emoji: '🏦', color: 'bg-slate-50 border-slate-100' },
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function Chip({ emoji, label, amber }: { emoji?: string; label: string; amber?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border
            ${amber
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
            {emoji && <span>{emoji}</span>}
            {label}
        </span>
    )
}

// Visual step with illustration area
function DrawerStep({
    emoji,
    illustration,
    label,
    sub,
    isLast,
}: {
    emoji: string
    illustration: React.ReactNode
    label: string
    sub: string
    isLast?: boolean
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
                {/* Circle with large emoji */}
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0">
                    {emoji}
                </div>
                {!isLast && <div className="w-px h-6 bg-emerald-100 mt-1" />}
            </div>
            <div className="flex-1 min-w-0 pt-1 pb-4">
                <p className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{label}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{sub}</p>
                {/* Inline illustration */}
                {illustration && (
                    <div className="mt-2">{illustration}</div>
                )}
            </div>
        </div>
    )
}

function SectionLabel({ emoji, children }: { emoji?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-1.5 mb-3">
            {emoji && <span className="text-sm">{emoji}</span>}
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{children}</p>
        </div>
    )
}

// ─────────────────────────────────────────────
// VISUAL ILLUSTRATIONS (pure div/emoji art)
// ─────────────────────────────────────────────

// Step 1: Phone with app screen
const AppIllustration = () => (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 w-fit">
        <div className="w-10 h-14 rounded-lg bg-slate-800 border-2 border-slate-700 flex flex-col items-center justify-center gap-1 p-1">
            <div className="w-full h-1.5 bg-emerald-400 rounded-full" />
            <div className="w-3/4 h-1 bg-slate-500 rounded-full" />
            <div className="w-3/4 h-1 bg-slate-500 rounded-full" />
            <div className="w-full h-2.5 rounded bg-emerald-500 mt-0.5 flex items-center justify-center">
                <span className="text-[5px] text-white font-black">RETURN</span>
            </div>
        </div>
        <div className="text-[10px] text-slate-500 max-w-[120px] leading-snug">
            Tap <span className="font-bold text-slate-700">"Return Item"</span> in your order details
        </div>
    </div>
)

// Step 2: Delivery partner at door
const PickupIllustration = ({ isDoorstep }: { isDoorstep: boolean }) => (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 w-fit">
        {isDoorstep ? (
            <>
                <div className="flex items-end gap-1">
                    {/* house */}
                    <div className="flex flex-col items-center">
                        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[8px] border-l-transparent border-r-transparent border-b-slate-500" />
                        <div className="w-10 h-8 bg-amber-100 border border-amber-200 rounded-b-sm flex items-end justify-center pb-0.5">
                            <div className="w-3 h-5 bg-amber-700 rounded-t-sm" />
                        </div>
                    </div>
                    {/* scooter rider */}
                    <span className="text-xl mb-1">🛵</span>
                </div>
                <div className="text-[10px] text-slate-500 max-w-[110px] leading-snug">
                    Partner arrives, inspects &amp; picks up your item
                </div>
            </>
        ) : (
            <>
                <span className="text-2xl">🏪</span>
                <div className="text-[10px] text-slate-500 max-w-[110px] leading-snug">
                    Drop the item at your <span className="font-bold text-slate-700">nearest hub</span>
                </div>
            </>
        )}
    </div>
)

// Step 3: Refund to wallet/card
const RefundIllustration = () => (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 w-fit">
        <div className="flex items-center gap-1">
            <span className="text-lg">✅</span>
            <span className="text-slate-400 text-xs">→</span>
            <span className="text-lg">💰</span>
        </div>
        <div className="text-[10px] text-slate-500 max-w-[120px] leading-snug">
            QC passes → refund hits your account
        </div>
    </div>
)

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
                    <Chip emoji="⏱️" label={windowText} />
                    {rp.doorstepQcRequired && <Chip emoji="🚪" label="Doorstep pickup" />}
                    {rp.requiresQcPhoto && <Chip emoji="📸" label="Photo required" amber />}
                </div>

                <Separator />

                {/* How to return — visual steps */}
                <div>
                    <SectionLabel emoji="🔄">How to return</SectionLabel>
                    <DrawerStep
                        emoji="📱"
                        label="1 · Request a return"
                        sub="Open the app within the return window and tap 'Return Item'."
                        illustration={<AppIllustration />}
                    />
                    <DrawerStep
                        emoji={rp.doorstepQcRequired ? '🚪' : '🏪'}
                        label={`2 · ${rp.doorstepQcRequired ? 'Pickup at your door' : 'Drop off at hub'}`}
                        sub={rp.doorstepQcRequired
                            ? 'A delivery partner visits, inspects the item, and collects it.'
                            : 'Drop the item at your nearest return hub.'}
                        illustration={<PickupIllustration isDoorstep={rp.doorstepQcRequired} />}
                    />
                    <DrawerStep
                        emoji="💸"
                        label="3 · Refund processed"
                        sub="Refund is issued to your selected method after QC passes."
                        illustration={<RefundIllustration />}
                        isLast
                    />
                </div>

                {/* Conditions */}
                {rp.conditions.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <SectionLabel emoji="📋">Item must be</SectionLabel>
                            <div className="grid grid-cols-2 gap-2">
                                {rp.conditions.map((c) => (
                                    <div
                                        key={c}
                                        className="flex flex-col gap-1 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5"
                                    >
                                        <span className="text-xl">{conditionLabels[c].emoji}</span>
                                        <span className="text-xs font-bold text-slate-700 leading-tight">
                                            {conditionLabels[c].label}
                                        </span>
                                        <span className="text-[10px] text-slate-400 leading-snug">
                                            {conditionLabels[c].hint}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Photo required callout */}
                {rp.requiresQcPhoto && (
                    <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
                        <span className="text-2xl shrink-0">📸</span>
                        <div>
                            <p className="text-xs font-bold text-amber-800 mb-0.5">Photo evidence required</p>
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                                Attach a clear photo of the item before submitting your return request. Blurry or missing photos may cause delays.
                            </p>
                        </div>
                    </div>
                )}

                {/* Refund methods */}
                {rp.refundMethods.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <SectionLabel emoji="💰">Refund options</SectionLabel>
                            <div className="space-y-2">
                                {rp.refundMethods.map((m) => {
                                    const meta = refundMethodLabels[m]
                                    return (
                                        <div
                                            key={m}
                                            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${meta.color}`}
                                        >
                                            <span className="text-2xl shrink-0">{meta.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-700 leading-tight">{meta.label}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Processing time</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                                {meta.duration}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Exchange */}
                {hasExchange && (
                    <>
                        <Separator />
                        <div className="flex items-start gap-3 rounded-2xl bg-violet-50 border border-violet-200 px-4 py-3">
                            <span className="text-2xl shrink-0">🔄</span>
                            <div>
                                <p className="text-xs font-bold text-violet-800 mb-0.5">Exchange available</p>
                                <p className="text-[11px] text-violet-700 leading-relaxed">
                                    {rp.exchangeAllowed === ExchangeAllowed.SIZE_ONLY
                                        ? 'Size exchanges only — select the correct size when requesting.'
                                        : 'Full exchange on any eligible variant.'}
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Non-returnable reasons */}
                {rp.nonReturnableReasons.length > 0 && (
                    <>
                        <Separator />
                        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">⚠️</span>
                                <p className="text-xs font-bold text-red-700">Not applicable when</p>
                            </div>
                            <ul className="space-y-1.5">
                                {rp.nonReturnableReasons.map((r) => (
                                    <li key={r} className="flex items-start gap-2 text-[11px] text-red-600">
                                        <span className="text-red-300 mt-0.5">✕</span>
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                {/* Fine print */}
                <div className="flex items-start gap-2 border-t border-slate-100 pt-4">
                    <span className="text-sm shrink-0">ℹ️</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        Return window starts from the date of delivery. Items that fail quality check at pickup will be sent back to you with no refund issued.
                    </p>
                </div>

            </div>
        </ScrollArea>
    )
}

// ─────────────────────────────────────────────
// NON-RETURNABLE CARD
// ─────────────────────────────────────────────

function NonReturnableCard({ returnPolicy }: { returnPolicy?: ReturnPolicy }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="text-2xl shrink-0">🚫</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700">Non-returnable</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        This item cannot be returned once delivered.
                    </p>
                </div>
                <XCircle className="h-4 w-4 text-slate-300 shrink-0" />
            </div>
            {returnPolicy?.nonReturnableReasons && returnPolicy.nonReturnableReasons.length > 0 && (
                <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                    {returnPolicy.nonReturnableReasons.map((r) => (
                        <span
                            key={r}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-500 font-medium"
                        >
                            {r}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// EXPORTED: ReturnPolicyDrawer
// ─────────────────────────────────────────────

interface ReturnPolicyDrawerProps {
    returnPolicy?: ReturnPolicy
    trigger?: 'button' | 'card'
}

export function ReturnPolicyDrawer({ returnPolicy, trigger = 'button' }: ReturnPolicyDrawerProps) {
    const [open, setOpen] = useState(false)
    const isReturnable = returnPolicy?.isReturnable ?? false

    const windowDisplay = isReturnable && returnPolicy
        ? `${returnPolicy.windowValue} ${returnPolicy.windowUnit === ReturnWindowUnit.DAYS ? 'days' : 'hours'} from delivery date`
        : null

    if (!isReturnable) {
        return <NonReturnableCard returnPolicy={returnPolicy} />
    }

    const rp = returnPolicy!

    const buttonTrigger = (
        <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40
                hover:bg-emerald-50 hover:border-emerald-300 active:scale-[0.99]
                transition-all duration-150 text-left group"
        >
            <span className="text-2xl shrink-0">↩️</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-800 leading-tight">
                    {rp.windowValue}{' '}
                    {rp.windowUnit === ReturnWindowUnit.DAYS ? (rp.windowValue === 1 ? 'day' : 'days') : (rp.windowValue === 1 ? 'hour' : 'hours')}{' '}
                    return window
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">Tap to see full return &amp; refund policy</p>
            </div>
            <ChevronRight className="h-4 w-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
        </button>
    )

    const cardTrigger = (
        <button type="button" onClick={() => setOpen(true)} className="w-full text-left group">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-150 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="text-2xl shrink-0">↩️</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-800 leading-tight">Return policy</p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                            {rp.windowValue}{' '}
                            {rp.windowUnit === ReturnWindowUnit.DAYS ? (rp.windowValue === 1 ? 'day' : 'days') : (rp.windowValue === 1 ? 'hour' : 'hours')}{' '}
                            return window
                        </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
                </div>
                <div className="flex flex-wrap gap-1.5 px-4 pb-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                        ⏱️ {rp.windowValue}{rp.windowUnit === ReturnWindowUnit.DAYS ? 'd' : 'h'} window
                    </span>
                    {rp.refundMethods.slice(0, 1).map(m => (
                        <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                            {refundMethodLabels[m].emoji} {refundMethodLabels[m].label}
                        </span>
                    ))}
                    {rp.doorstepQcRequired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                            🚪 Doorstep pickup
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                        View full policy →
                    </span>
                </div>
            </div>
        </button>
    )

    return (
        <>
            {trigger === 'card' ? cardTrigger : buttonTrigger}

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col gap-0 [&>button]:hidden">
                    <SheetHeader className="px-5 py-4 border-b border-emerald-100 bg-emerald-50/60 shrink-0 space-y-0">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl shrink-0">↩️</span>
                            <div className="flex-1 min-w-0">
                                <SheetTitle className="text-sm font-black text-emerald-900 leading-tight">
                                    Return &amp; refund policy
                                </SheetTitle>
                                <SheetDescription className="text-xs text-emerald-600 mt-0.5 font-medium">
                                    {windowDisplay}
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
                    <ReturnDrawerBody rp={rp} />
                </SheetContent>
            </Sheet>
        </>
    )
}