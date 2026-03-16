"use client"
/* ─────────────────────────────────────────────────────────────
   OrderFilters.tsx  —  search + status filter + bulk actions
   Uses: shadcn Input, Select, Checkbox, Button
───────────────────────────────────────────────────────────────*/
import React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ALL_STATUSES, STATUS_META, type OrderStatus } from "@/types/order-constants"

interface Props {
    rawSearch: string
    onSearch: (v: string) => void
    status: string
    onStatus: (v: string) => void
    selectedIds: Set<string>
    allIds: string[]
    onSelectAll: (checked: boolean) => void
    onClearSelect: () => void
    onBulkExport?: () => void
}

export function OrderFilters({
    rawSearch, onSearch,
    status, onStatus,
    selectedIds, allIds,
    onSelectAll, onClearSelect,
    onBulkExport,
}: Props) {
    const allChecked = allIds.length > 0 && selectedIds.size === allIds.length
    const someChecked = selectedIds.size > 0 && !allChecked
    const hasSelected = selectedIds.size > 0

    return (
        <div className="space-y-3">
            {/* ── search + filter row ── */}
            <div className="flex flex-col sm:flex-row gap-2.5">
                {/* search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                        placeholder="Search order ID, name, phone…"
                        className="pl-9 rounded-xl border-slate-200 bg-white text-sm h-10 focus-visible:ring-indigo-400"
                        value={rawSearch}
                        onChange={e => onSearch(e.target.value)}
                    />
                    {rawSearch && (
                        <button
                            onClick={() => onSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* status filter */}
                <Select value={status} onValueChange={onStatus}>
                    <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white h-10 text-sm">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="text-sm font-semibold">All Statuses</SelectItem>
                        {ALL_STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="text-sm">
                                <span className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full flex-shrink-0"
                                        style={{ background: STATUS_META[s]?.dot }}
                                    />
                                    {STATUS_META[s]?.label ?? s}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ── status pill filters ── */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => onStatus("all")}
                    className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-bold border transition-all",
                        status === "all"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                >
                    All
                </button>
                {(["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"] as OrderStatus[]).map(s => {
                    const m = STATUS_META[s]
                    const active = status === s
                    return (
                        <button
                            key={s}
                            onClick={() => onStatus(active ? "all" : s)}
                            className={cn(
                                "px-3 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5",
                                active ? `${m.pill} border-current` : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
                            {m.short}
                        </button>
                    )
                })}
            </div>

            {/* ── bulk action bar ── */}
            {hasSelected && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 animate-in slide-in-from-top-2 duration-200">
                    <Checkbox
                        checked={allChecked}
                        onCheckedChange={checked => onSelectAll(!!checked)}
                        className="border-indigo-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <span className="text-xs font-bold text-indigo-700">
                        {selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex gap-2 ml-auto">
                        {onBulkExport && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 rounded-lg text-[11px] font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                                onClick={onBulkExport}
                            >
                                Export
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-white"
                            onClick={onClearSelect}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* ── select-all checkbox when nothing selected ── */}
            {!hasSelected && allIds.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                    <Checkbox
                        id="select-all"
                        checked={allChecked}
                        onCheckedChange={checked => onSelectAll(!!checked)}
                        className="border-slate-300"
                    />
                    <label htmlFor="select-all" className="text-[11px] font-semibold text-slate-400 cursor-pointer select-none">
                        Select all on this page
                    </label>
                </div>
            )}
        </div>
    )
}