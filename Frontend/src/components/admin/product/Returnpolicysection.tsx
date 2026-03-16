"use client"

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    RotateCcw, Info, X, Clock, ShieldCheck,
    Banknote, RefreshCw, AlertCircle, Plus, Check,
} from 'lucide-react'
import {
    ReturnWindowUnit, ReturnCondition, RefundMethod, ExchangeAllowed,
} from '@/services/product.service'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ReturnPolicyData {
    isReturnable: boolean
    windowValue: number
    windowUnit: ReturnWindowUnit
    conditions: ReturnCondition[]
    requiresQcPhoto: boolean
    doorstepQcRequired: boolean
    refundMethods: RefundMethod[]
    exchangeAllowed: ExchangeAllowed
    nonReturnableReasons: string[]
    excludedSkuPatterns: string[]
    internalNote: string
}

export const defaultReturnPolicy: ReturnPolicyData = {
    isReturnable: false,
    windowValue: 7,
    windowUnit: ReturnWindowUnit.DAYS,
    conditions: [],
    requiresQcPhoto: false,
    doorstepQcRequired: true,
    refundMethods: [RefundMethod.ORIGINAL_SOURCE],
    exchangeAllowed: ExchangeAllowed.NO,
    nonReturnableReasons: [],
    excludedSkuPatterns: [],
    internalNote: '',
}

// ─────────────────────────────────────────────
// PRESETS
// ─────────────────────────────────────────────

const PRESET_REASONS: { label: string; value: string }[] = [
    { label: 'Perishable item', value: 'Perishable item' },
    { label: 'Digital product', value: 'Digital product' },
    { label: 'Hygiene product', value: 'Hygiene / personal care product' },
    { label: 'Customised item', value: 'Customised / personalised item' },
    { label: 'Seal broken', value: 'Seal broken or packaging opened' },
    { label: 'Used / worn', value: 'Item has been used or worn' },
    { label: 'Missing tags', value: 'Tags or labels removed' },
    { label: 'Software / licence', value: 'Software / licence key product' },
    { label: 'Hazardous item', value: 'Hazardous or restricted material' },
    { label: 'Bundle item', value: 'Part of a non-separable bundle' },
    { label: 'Sale / clearance', value: 'Sale or clearance item — no returns' },
    { label: 'No original box', value: 'Original packaging not available' },
]

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
// FIELD LABEL
// ─────────────────────────────────────────────

function FieldLabel({ label, tooltip, required }: { label: string; tooltip?: string; required?: boolean }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5">
            <Label className="text-sm font-medium text-slate-700">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
            {tooltip && (
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                            {tooltip}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// MULTI SELECT BADGES
// ─────────────────────────────────────────────

function MultiSelectBadges<T extends string>({
    options, selected, labels, onChange,
}: { options: T[]; selected: T[]; labels: Record<T, string>; onChange: (next: T[]) => void }) {
    const toggle = (val: T) =>
        onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
    return (
        <div className="flex flex-wrap gap-2 pt-1">
            {options.map(opt => {
                const active = selected.includes(opt)
                return (
                    <button key={opt} type="button" onClick={() => toggle(opt)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 select-none
                            ${active ? 'bg-green-50 border-green-500 text-green-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
                        {labels[opt]}
                    </button>
                )
            })}
        </div>
    )
}

// ─────────────────────────────────────────────
// NON-RETURNABLE REASONS — preset + custom + edit
// ─────────────────────────────────────────────

function NonReturnableReasonsInput({
    values, onChange,
}: { values: string[]; onChange: (next: string[]) => void }) {
    const [customInput, setCustomInput] = React.useState('')
    const [editingIdx, setEditingIdx] = React.useState<number | null>(null)
    const [editValue, setEditValue] = React.useState('')

    const addCustom = () => {
        const t = customInput.trim()
        if (t && !values.includes(t)) onChange([...values, t])
        setCustomInput('')
    }

    const togglePreset = (val: string) =>
        onChange(values.includes(val) ? values.filter(v => v !== val) : [...values, val])

    const remove = (v: string) => onChange(values.filter(x => x !== v))

    const startEdit = (idx: number) => { setEditingIdx(idx); setEditValue(values[idx]) }

    const saveEdit = () => {
        if (editingIdx === null) return
        const t = editValue.trim()
        if (t) { const n = [...values]; n[editingIdx] = t; onChange(n) }
        setEditingIdx(null); setEditValue('')
    }

    return (
        <div className="space-y-3">

            {/* Preset chips */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Quick-add presets
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {PRESET_REASONS.map(preset => {
                        const active = values.includes(preset.value)
                        return (
                            <button key={preset.value} type="button"
                                onClick={() => togglePreset(preset.value)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 select-none
                                    ${active
                                        ? 'bg-red-50 border-red-400 text-red-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600'
                                    }`}>
                                {active
                                    ? <Check className="h-3 w-3 shrink-0" />
                                    : <Plus className="h-3 w-3 shrink-0" />}
                                {preset.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Custom reason input */}
            <div className="flex gap-2">
                <Input
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                    placeholder="Type a custom reason and press Enter…"
                    className="h-9 text-sm"
                />
                <button type="button" onClick={addCustom}
                    disabled={!customInput.trim()}
                    className="px-3 h-9 rounded-md border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
                    Add
                </button>
            </div>

            {/* Selected list — editable rows */}
            {values.length > 0 && (
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {values.length} reason{values.length > 1 ? 's' : ''} added
                        </span>
                        <button type="button" onClick={() => onChange([])}
                            className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider">
                            Clear all
                        </button>
                    </div>
                    {/* Rows */}
                    {values.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white group">
                            <span className="text-slate-300 text-xs select-none w-4 text-center shrink-0">{idx + 1}.</span>
                            {editingIdx === idx ? (
                                <div className="flex-1 flex gap-1.5">
                                    <Input autoFocus value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') { e.preventDefault(); saveEdit() }
                                            if (e.key === 'Escape') setEditingIdx(null)
                                        }}
                                        className="h-7 text-xs py-1" />
                                    <button type="button" onClick={saveEdit}
                                        className="px-2 h-7 rounded border border-green-300 bg-green-50 text-green-700 text-[10px] font-bold hover:bg-green-100 transition-colors shrink-0">
                                        Save
                                    </button>
                                    <button type="button" onClick={() => setEditingIdx(null)}
                                        className="px-2 h-7 rounded border border-slate-200 text-slate-500 text-[10px] font-bold hover:bg-slate-50 transition-colors shrink-0">
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="flex-1 text-xs text-slate-700 leading-snug cursor-text hover:text-slate-900"
                                        onClick={() => startEdit(idx)} title="Click to edit">
                                        {v}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button type="button" onClick={() => startEdit(idx)}
                                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors">
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => remove(v)}
                                            className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// EXCLUDED SKU INPUT
// Shows existing variant SKUs as clickable chips.
// Admin can also manually type custom patterns.
// ─────────────────────────────────────────────

interface ExcludedSkuInputProps {
    values: string[]
    onChange: (next: string[]) => void
    variantSkus: string[]
}

function ExcludedSkuInput({ values, onChange, variantSkus }: ExcludedSkuInputProps) {
    const [input, setInput] = React.useState('')

    const toggle = (sku: string) =>
        onChange(values.includes(sku) ? values.filter(v => v !== sku) : [...values, sku])

    const addManual = () => {
        const t = input.trim()
        if (t && !values.includes(t)) onChange([...values, t])
        setInput('')
    }

    const remove = (v: string) => onChange(values.filter(x => x !== v))

    return (
        <div className="space-y-3">

            {/* Existing variant SKU chips */}
            {variantSkus.length > 0 ? (
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Select from existing variant SKUs
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {variantSkus.map(sku => {
                            const active = values.includes(sku)
                            return (
                                <button
                                    key={sku}
                                    type="button"
                                    onClick={() => toggle(sku)}
                                    title={active ? 'Click to un-exclude' : 'Click to exclude this SKU from returns'}
                                    className={`
                                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium
                                        border transition-all duration-150 select-none
                                        ${active
                                            ? 'bg-orange-50 border-orange-400 text-orange-700 line-through decoration-orange-400'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                                        }
                                    `}
                                >
                                    {active
                                        ? <X className="h-3 w-3 shrink-0" style={{ textDecoration: 'none' }} />
                                        : <Plus className="h-3 w-3 shrink-0" />
                                    }
                                    {sku}
                                </button>
                            )
                        })}
                    </div>
                    {values.filter(v => variantSkus.includes(v)).length === 0 && (
                        <p className="text-[10px] text-slate-400 mt-1.5">
                            No variant SKUs excluded yet. Click a SKU above to mark it as non-returnable.
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                    <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-500">
                        No variants added to this product yet. You can still enter custom SKU patterns manually below.
                    </p>
                </div>
            )}

            {/* Manual pattern input */}
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Add custom SKU pattern
                </p>
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addManual() } }}
                        placeholder="e.g. BUNDLE-, ACC-, -KIT…"
                        className="h-9 text-sm font-mono"
                    />
                    <button
                        type="button"
                        onClick={addManual}
                        disabled={!input.trim()}
                        className="px-3 h-9 rounded-md border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                    Patterns match any SKU containing that text. e.g.{" "}
                    <code className="bg-slate-100 px-1 rounded text-slate-600">BUNDLE-</code> excludes{" "}
                    <code className="bg-slate-100 px-1 rounded text-slate-600">BUNDLE-001</code>,{" "}
                    <code className="bg-slate-100 px-1 rounded text-slate-600">BUNDLE-XL</code>, etc.
                </p>
            </div>

            {/* All excluded — summary */}
            {values.length > 0 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50/40 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-orange-50 border-b border-orange-100">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                            {values.length} excluded SKU{values.length > 1 ? 's' : ''} / pattern{values.length > 1 ? 's' : ''}
                        </span>
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="text-[10px] font-bold text-orange-400 hover:text-red-600 transition-colors uppercase tracking-wider"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-3">
                        {values.map(v => (
                            <span
                                key={v}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-[11px] font-mono text-orange-700 font-medium"
                            >
                                {v}
                                <button
                                    type="button"
                                    onClick={() => remove(v)}
                                    className="rounded-full hover:bg-orange-100 p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

interface ReturnPolicySectionProps {
    data: any
    onChange: (field: string, value: any) => void
    /** Existing product variants — used to show SKU chips in the excluded-SKU picker */
    variants?: { sku: string; _id: string }[]
}

export default function ReturnPolicySection({ data, onChange, variants = [] }: ReturnPolicySectionProps) {
    const policy: ReturnPolicyData = { ...defaultReturnPolicy, ...(data.returnPolicy || {}) }
    const update = (key: keyof ReturnPolicyData, value: any) =>
        onChange('returnPolicy', { ...policy, [key]: value })

    return (
        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-green-100">
                            <RotateCcw className="h-4 w-4 text-green-700" />
                        </div>
                        <CardTitle className="text-base font-semibold text-slate-800">Return policy</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                            {policy.isReturnable ? 'Returnable' : 'Non-returnable'}
                        </span>
                        <Switch checked={policy.isReturnable} onCheckedChange={v => update('isReturnable', v)} />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-6 py-5 space-y-6">

                {!policy.isReturnable && (
                    <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            This product is currently marked as <strong>non-returnable</strong>. Toggle
                            the switch above to configure return terms. You can still add reasons below
                            to show customers why returns are not accepted.
                        </p>
                    </div>
                )}

                {/* Return window */}
                <div>
                    <FieldLabel label="Return window" tooltip="How long after delivery the customer can request a return." required={policy.isReturnable} />
                    <div className="flex gap-2">
                        <Input type="number" min={0} value={policy.windowValue}
                            onChange={e => update('windowValue', Number(e.target.value))}
                            disabled={!policy.isReturnable} className="h-9 w-24 text-sm" />
                        <Select value={policy.windowUnit} onValueChange={v => update('windowUnit', v as ReturnWindowUnit)} disabled={!policy.isReturnable}>
                            <SelectTrigger className="h-9 w-28 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ReturnWindowUnit.DAYS}>Days</SelectItem>
                                <SelectItem value={ReturnWindowUnit.HOURS}>Hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Accepted conditions */}
                <div>
                    <FieldLabel label="Accepted conditions" tooltip="Item must meet at least one selected condition to be eligible for return." />
                    <MultiSelectBadges options={Object.values(ReturnCondition)} selected={policy.conditions} labels={conditionLabels} onChange={v => update('conditions', v)} />
                </div>

                {/* QC toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-white">
                        <ShieldCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 leading-none mb-0.5">Doorstep QC</p>
                            <p className="text-xs text-slate-500 leading-relaxed">Delivery partner inspects item at customer door before pickup.</p>
                        </div>
                        <Switch checked={policy.doorstepQcRequired} onCheckedChange={v => update('doorstepQcRequired', v)} disabled={!policy.isReturnable} />
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 bg-white">
                        <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 leading-none mb-0.5">Require QC photo</p>
                            <p className="text-xs text-slate-500 leading-relaxed">Customer must upload photo evidence before request is approved.</p>
                        </div>
                        <Switch checked={policy.requiresQcPhoto} onCheckedChange={v => update('requiresQcPhoto', v)} disabled={!policy.isReturnable} />
                    </div>
                </div>

                {/* Refund methods */}
                <div>
                    <FieldLabel label="Accepted refund methods" tooltip="Determines which refund destinations are offered to the customer." required={policy.isReturnable} />
                    <MultiSelectBadges options={Object.values(RefundMethod)} selected={policy.refundMethods} labels={refundMethodLabels} onChange={v => update('refundMethods', v)} />
                </div>

                {/* Exchange */}
                <div>
                    <FieldLabel label="Exchange allowed" tooltip="Whether the customer can exchange instead of return for a refund." />
                    <Select value={policy.exchangeAllowed} onValueChange={v => update('exchangeAllowed', v as ExchangeAllowed)} disabled={!policy.isReturnable}>
                        <SelectTrigger className="h-9 text-sm w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.values(ExchangeAllowed).map(opt => (
                                <SelectItem key={opt} value={opt}>
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                                        {exchangeLabels[opt]}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* ── Non-returnable reasons — ENHANCED ── */}
                <div>
                    <FieldLabel
                        label="Non-returnable reasons"
                        tooltip="Shown to customers when a return is rejected. Pick from presets or add a custom reason."
                    />
                    <NonReturnableReasonsInput
                        values={policy.nonReturnableReasons}
                        onChange={v => update('nonReturnableReasons', v)}
                    />
                </div>

                {/* Excluded SKU patterns */}
                <div>
                    <FieldLabel
                        label="Excluded SKU patterns"
                        tooltip="Select existing variant SKUs to exclude, or type a pattern. Matching SKUs will be non-returnable even if the parent product allows returns."
                    />
                    <ExcludedSkuInput
                        values={policy.excludedSkuPatterns}
                        onChange={v => update('excludedSkuPatterns', v)}
                        variantSkus={variants.map(v => v.sku).filter(Boolean)}
                    />
                </div>

                {/* Internal note */}
                <div>
                    <FieldLabel label="Internal note" tooltip="Admin-only note. Not visible to customers." />
                    <Textarea value={policy.internalNote} onChange={e => update('internalNote', e.target.value)}
                        placeholder="e.g. Refer to category ops team for edge cases…" rows={2} className="text-sm resize-none" />
                </div>

                {/* Summary chips */}
                {policy.isReturnable && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                        <SummaryChip icon={<Clock className="h-3 w-3" />} label={`${policy.windowValue} ${policy.windowUnit.toLowerCase()} window`} />
                        {policy.doorstepQcRequired && <SummaryChip icon={<ShieldCheck className="h-3 w-3" />} label="Doorstep QC" />}
                        {policy.requiresQcPhoto && <SummaryChip icon={<ShieldCheck className="h-3 w-3" />} label="Photo required" />}
                        {policy.refundMethods.map(m => <SummaryChip key={m} icon={<Banknote className="h-3 w-3" />} label={refundMethodLabels[m]} />)}
                        {policy.exchangeAllowed !== ExchangeAllowed.NO && <SummaryChip icon={<RefreshCw className="h-3 w-3" />} label={exchangeLabels[policy.exchangeAllowed]} />}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function SummaryChip({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            {icon}{label}
        </span>
    )
}