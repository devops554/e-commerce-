"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit, Layers, PackageX, AlertCircle, Tag, Box } from 'lucide-react'
import { ProductVariant } from '@/services/product.service'

interface VariantManagementSectionProps {
    productId?: string
    variants: ProductVariant[]
    onAddVariant: () => void
    onEditVariant: (variant: ProductVariant) => void
    onDeleteVariant: (id: string) => void
}

// ── Stock level helpers ──
function stockColor(stock: number) {
    if (stock <= 0) return { bar: 'bg-red-400', text: 'text-red-500', label: 'Out of stock' }
    if (stock <= 5) return { bar: 'bg-amber-400', text: 'text-amber-500', label: 'Low stock' }
    return { bar: 'bg-emerald-400', text: 'text-emerald-600', label: 'In stock' }
}

// ── Single variant card ──
function VariantCard({
    v,
    index,
    onEdit,
    onDelete,
}: {
    v: ProductVariant
    index: number
    onEdit: () => void
    onDelete: () => void
}) {
    const stock = stockColor(v.stock ?? 0)
    const hasDiscount = (v.discount ?? 0) > 0
    const effectivePrice = hasDiscount ? v.discountPrice : v.price

    return (
        <div className="group relative flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all duration-200">

            {/* Index pill */}
            <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[9px] font-black flex items-center justify-center z-10 select-none">
                {index + 1}
            </div>

            {/* Thumbnail */}
            <div className="shrink-0 h-14 w-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                {v.images?.[0]?.url ? (
                    <img
                        src={v.images[0].url}
                        alt={v.sku}
                        className="object-cover h-full w-full"
                    />
                ) : (
                    <Box className="h-5 w-5 text-slate-300" />
                )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0 space-y-2">

                {/* Price row */}
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                        ₹{effectivePrice?.toLocaleString('en-IN')}
                    </span>
                    {hasDiscount && (
                        <>
                            <span className="text-xs text-slate-400 line-through">
                                ₹{v.price?.toLocaleString('en-IN')}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-green-50 border border-green-200 text-[10px] font-bold text-green-700">
                                {v.discount}% OFF
                            </span>
                        </>
                    )}
                </div>

                {/* SKU */}
                <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-mono font-semibold text-slate-500 tracking-wider">
                        {v.sku}
                    </span>
                </div>

                {/* Attributes */}
                {(v.attributes || []).filter((a: any) => a.value).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {(v.attributes || []).map((attr: any, idx: number) =>
                            attr.value ? (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-medium"
                                >
                                    <span className="text-indigo-400 font-normal text-[9px] uppercase tracking-wider">
                                        {attr.name}
                                    </span>
                                    <span className="text-indigo-300 select-none">·</span>
                                    {attr.value}
                                </span>
                            ) : null
                        )}
                    </div>
                )}

                {/* Stock bar */}
                <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden max-w-[80px]">
                        <div
                            className={`h-full rounded-full ${stock.bar} transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(4, ((v.stock ?? 0) / 50) * 100))}%` }}
                        />
                    </div>
                    <span className={`text-[10px] font-bold ${stock.text}`}>
                        {v.stock ?? 0} · {stock.label}
                    </span>
                </div>
            </div>

            {/* Actions — visible on hover */}
            <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                    type="button"
                    onClick={onEdit}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    title="Edit variant"
                >
                    <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                    title="Delete variant"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

// ── Main component ──
export default function VariantManagementSection({
    productId,
    variants,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
}: VariantManagementSectionProps) {

    // ── No product yet ──
    if (!productId) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <AlertCircle className="h-4.5 w-4.5 text-slate-300" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500">Variants locked</p>
                    <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">
                        Save the product first to enable SKU, price, and stock variations.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-100">
                        <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Product variants</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {variants.length === 0
                                ? 'No variants yet'
                                : `${variants.length} variant${variants.length > 1 ? 's' : ''} · ${variants.filter(v => (v.stock ?? 0) > 0).length} in stock`
                            }
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onAddVariant}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm shadow-blue-200"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add variant
                </button>
            </div>

            {/* ── Variant list ── */}
            <div className="p-4">
                {variants.length === 0 ? (

                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                            <PackageX className="h-5 w-5 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                No variants
                            </p>
                            <p className="text-[11px] text-slate-300 max-w-[200px] leading-relaxed">
                                Click "Add variant" to define SKUs, pricing, and stock levels.
                            </p>
                        </div>
                    </div>

                ) : (

                    /* Variant cards */
                    <div className="space-y-3">
                        {variants.map((v, idx) => (
                            <VariantCard
                                key={v._id}
                                v={v}
                                index={idx}
                                onEdit={() => onEditVariant(v)}
                                onDelete={() => onDeleteVariant(v._id)}
                            />
                        ))}
                    </div>

                )}
            </div>

            {/* ── Footer summary bar (only when variants exist) ── */}
            {variants.length > 0 && (
                <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center gap-4 flex-wrap">
                    <Stat
                        label="Total variants"
                        value={variants.length}
                        color="text-slate-700"
                    />
                    <div className="w-px h-3 bg-slate-200" />
                    <Stat
                        label="In stock"
                        value={variants.filter(v => (v.stock ?? 0) > 0).length}
                        color="text-emerald-600"
                    />
                    <div className="w-px h-3 bg-slate-200" />
                    <Stat
                        label="Low / out"
                        value={variants.filter(v => (v.stock ?? 0) <= 5).length}
                        color="text-amber-600"
                    />
                    <div className="w-px h-3 bg-slate-200" />
                    <Stat
                        label="Price range"
                        value={
                            variants.length > 1
                                ? `₹${Math.min(...variants.map(v => v.discountPrice || v.price)).toLocaleString('en-IN')} – ₹${Math.max(...variants.map(v => v.discountPrice || v.price)).toLocaleString('en-IN')}`
                                : `₹${(variants[0]?.discountPrice || variants[0]?.price || 0).toLocaleString('en-IN')}`
                        }
                        color="text-blue-600"
                    />
                </div>
            )}
        </div>
    )
}

function Stat({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
            <span className={`text-[11px] font-black tabular-nums ${color}`}>{value}</span>
        </div>
    )
}