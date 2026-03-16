"use client"

import React from 'react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
    RotateCcw,
    Clock,
    ShieldCheck,
    Banknote,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Camera,
    DoorOpen,
    PackageX,
    ScanBarcode,
    NotebookPen,
} from 'lucide-react'
import {
    ReturnPolicy,
    ReturnWindowUnit,
    ReturnCondition,
    RefundMethod,
    ExchangeAllowed,
} from '@/services/product.service'

// ─────────────────────────────────────────────
// LABEL MAPS
// ─────────────────────────────────────────────

const conditionLabels: Record<ReturnCondition, string> = {
    [ReturnCondition.UNUSED]: 'Unused',
    [ReturnCondition.ORIGINAL_PACKAGING]: 'Original packaging',
    [ReturnCondition.WITH_TAGS]: 'With tags',
    [ReturnCondition.ANY]: 'Any condition',
}

const refundMethodLabels: Record<RefundMethod, string> = {
    [RefundMethod.ORIGINAL_SOURCE]: 'Original payment source',
    [RefundMethod.WALLET]: 'Wallet credit',
    [RefundMethod.BANK_TRANSFER]: 'Bank transfer',
}

const exchangeLabels: Record<ExchangeAllowed, string> = {
    [ExchangeAllowed.NO]: 'No exchange',
    [ExchangeAllowed.YES]: 'Full exchange allowed',
    [ExchangeAllowed.SIZE_ONLY]: 'Size exchange only',
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function PolicyRow({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    {label}
                </p>
                {children}
            </div>
        </div>
    )
}

function BooleanBadge({ value, trueLabel = 'Yes', falseLabel = 'No' }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
    return value ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> {trueLabel}
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            <XCircle className="h-3.5 w-3.5" /> {falseLabel}
        </span>
    )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

interface ReturnPolicyCardProps {
    returnPolicy?: ReturnPolicy
}

export default function ReturnPolicyCard({ returnPolicy }: ReturnPolicyCardProps) {
    const isReturnable = returnPolicy?.isReturnable ?? false

    return (
        <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* ── Header ── */}
            <div
                className={`px-6 py-4 flex items-center justify-between ${isReturnable
                        ? 'bg-green-50 border-b border-green-100'
                        : 'bg-slate-50 border-b border-slate-100'
                    }`}
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className={`p-1.5 rounded-lg ${isReturnable ? 'bg-green-100' : 'bg-slate-200'
                            }`}
                    >
                        <RotateCcw
                            className={`h-4 w-4 ${isReturnable ? 'text-green-700' : 'text-slate-500'
                                }`}
                        />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">Return policy</h3>
                </div>

                {isReturnable ? (
                    <Badge className="rounded-full bg-green-100 text-green-700 border-green-200 text-xs font-semibold px-3">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Returnable
                    </Badge>
                ) : (
                    <Badge className="rounded-full bg-red-50 text-red-600 border-red-200 text-xs font-semibold px-3">
                        <XCircle className="h-3 w-3 mr-1" /> Non-returnable
                    </Badge>
                )}
            </div>

            {/* ── Body ── */}
            <div className="px-6 py-2">
                {/* Non-returnable — minimal display */}
                {!isReturnable && (
                    <div className="flex items-start gap-3 py-4">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                This product cannot be returned once delivered.
                            </p>
                            {returnPolicy?.nonReturnableReasons &&
                                returnPolicy.nonReturnableReasons.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {returnPolicy.nonReturnableReasons.map((r) => (
                                            <span
                                                key={r}
                                                className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium"
                                            >
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                )}
                        </div>
                    </div>
                )}

                {/* Returnable — full detail */}
                {isReturnable && returnPolicy && (
                    <>
                        {/* Return window */}
                        <PolicyRow
                            icon={<Clock className="h-4 w-4" />}
                            label="Return window"
                        >
                            <p className="text-sm font-semibold text-slate-800">
                                {returnPolicy.windowValue}{' '}
                                {returnPolicy.windowUnit === ReturnWindowUnit.DAYS
                                    ? returnPolicy.windowValue === 1
                                        ? 'day'
                                        : 'days'
                                    : returnPolicy.windowValue === 1
                                        ? 'hour'
                                        : 'hours'}{' '}
                                after delivery
                            </p>
                        </PolicyRow>

                        {/* Accepted conditions */}
                        {returnPolicy.conditions.length > 0 && (
                            <PolicyRow
                                icon={<ShieldCheck className="h-4 w-4" />}
                                label="Accepted conditions"
                            >
                                <div className="flex flex-wrap gap-1.5">
                                    {returnPolicy.conditions.map((c) => (
                                        <Badge
                                            key={c}
                                            variant="secondary"
                                            className="text-[10px] bg-blue-50 text-blue-700 border-blue-100 rounded-full font-medium"
                                        >
                                            {conditionLabels[c]}
                                        </Badge>
                                    ))}
                                </div>
                            </PolicyRow>
                        )}

                        {/* QC requirements */}
                        <PolicyRow
                            icon={<DoorOpen className="h-4 w-4" />}
                            label="Doorstep QC"
                        >
                            <BooleanBadge
                                value={returnPolicy.doorstepQcRequired}
                                trueLabel="Partner inspects at your door"
                                falseLabel="Warehouse QC only"
                            />
                        </PolicyRow>

                        <PolicyRow
                            icon={<Camera className="h-4 w-4" />}
                            label="Photo evidence"
                        >
                            <BooleanBadge
                                value={returnPolicy.requiresQcPhoto}
                                trueLabel="Photo required from customer"
                                falseLabel="Not required"
                            />
                        </PolicyRow>

                        {/* Refund methods */}
                        {returnPolicy.refundMethods.length > 0 && (
                            <PolicyRow
                                icon={<Banknote className="h-4 w-4" />}
                                label="Refund methods"
                            >
                                <div className="flex flex-wrap gap-1.5">
                                    {returnPolicy.refundMethods.map((m) => (
                                        <Badge
                                            key={m}
                                            variant="secondary"
                                            className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100 rounded-full font-medium"
                                        >
                                            {refundMethodLabels[m]}
                                        </Badge>
                                    ))}
                                </div>
                            </PolicyRow>
                        )}

                        {/* Exchange */}
                        <PolicyRow
                            icon={<RefreshCw className="h-4 w-4" />}
                            label="Exchange"
                        >
                            <span
                                className={`text-xs font-semibold ${returnPolicy.exchangeAllowed === ExchangeAllowed.NO
                                        ? 'text-slate-400'
                                        : 'text-violet-700'
                                    }`}
                            >
                                {exchangeLabels[returnPolicy.exchangeAllowed]}
                            </span>
                        </PolicyRow>

                        {/* Non-returnable reasons */}
                        {returnPolicy.nonReturnableReasons.length > 0 && (
                            <PolicyRow
                                icon={<PackageX className="h-4 w-4" />}
                                label="Non-returnable reasons"
                            >
                                <div className="flex flex-wrap gap-1.5">
                                    {returnPolicy.nonReturnableReasons.map((r) => (
                                        <span
                                            key={r}
                                            className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium"
                                        >
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            </PolicyRow>
                        )}

                        {/* Excluded SKU patterns */}
                        {returnPolicy.excludedSkuPatterns.length > 0 && (
                            <PolicyRow
                                icon={<ScanBarcode className="h-4 w-4" />}
                                label="Excluded SKU patterns"
                            >
                                <div className="flex flex-wrap gap-1.5">
                                    {returnPolicy.excludedSkuPatterns.map((p) => (
                                        <code
                                            key={p}
                                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                                        >
                                            {p}
                                        </code>
                                    ))}
                                </div>
                            </PolicyRow>
                        )}

                        {/* Internal note — admin only */}
                        {returnPolicy.internalNote && (
                            <PolicyRow
                                icon={<NotebookPen className="h-4 w-4" />}
                                label="Internal note (admin only)"
                            >
                                <p className="text-xs text-slate-500 italic leading-relaxed">
                                    {returnPolicy.internalNote}
                                </p>
                            </PolicyRow>
                        )}
                    </>
                )}

                {/* No policy at all */}
                {!returnPolicy && (
                    <div className="py-4 flex items-center gap-2 text-slate-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p className="text-xs">No return policy configured for this product.</p>
                    </div>
                )}
            </div>
        </div>
    )
}