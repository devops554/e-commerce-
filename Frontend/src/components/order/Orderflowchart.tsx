"use client"
/* ─────────────────────────────────────────────────────────────
   OrderFlowChart.tsx
   Shows two views toggled by tabs:
   1. Area chart  — orders over time (7d / 30d / 90d)
   2. Funnel bars — count at each order stage

   Props:
     orders  — raw order array from useOrders
     isLoading
───────────────────────────────────────────────────────────── */
import React, { useMemo, useState } from "react"
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from "recharts"
import { FLOW_STEPS, STATUS_META, getSM } from "@/types/order-constants"
import { cn } from "@/lib/utils"
import { TrendingUp, BarChart2 } from "lucide-react"

/* ── types ── */
interface Props {
    orders: any[]
    isLoading: boolean
}

type Period = "7d" | "30d" | "90d"

/* ── tiny tab ── */
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                active
                    ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                    : "text-slate-400 hover:text-slate-600"
            )}
        >
            {children}
        </button>
    )
}

/* ── custom tooltip ── */
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 shadow-lg text-xs font-semibold">
            <p className="text-slate-400 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
            ))}
        </div>
    )
}

/* ── main ── */
export function OrderFlowChart({ orders, isLoading }: Props) {
    const [view, setView] = useState<"area" | "funnel">("area")
    const [period, setPeriod] = useState<Period>("30d")

    /* ── area data: group by day ── */
    const areaData = useMemo(() => {
        const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
        const now = Date.now()
        const buckets: Record<string, { date: string; orders: number; delivered: number }> = {}

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now - i * 86400000)
            const key = `${d.getMonth() + 1}/${d.getDate()}`
            buckets[key] = { date: key, orders: 0, delivered: 0 }
        }

        orders.forEach(o => {
            const d = new Date(o.createdAt)
            const key = `${d.getMonth() + 1}/${d.getDate()}`
            if (buckets[key]) {
                buckets[key].orders++
                if (o.orderStatus === "delivered") buckets[key].delivered++
            }
        })

        return Object.values(buckets)
    }, [orders, period])

    /* ── funnel data: count per stage ── */
    const funnelData = useMemo(() => {
        const counts: Record<string, number> = {}
        orders.forEach(o => {
            counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1
        })
        return FLOW_STEPS.map(s => ({
            name: STATUS_META[s]?.short ?? s,
            full: STATUS_META[s]?.label ?? s,
            count: counts[s] ?? 0,
            fill: STATUS_META[s]?.bar ?? "#94A3B8",
        }))
    }, [orders])

    /* ── off-flow counts ── */
    const offFlow = useMemo(() => {
        const bad = ["failed", "cancelled", "returned", "failed_delivery", "PENDING_REASSIGNMENT"]
        return bad.map(s => ({ s, count: orders.filter(o => o.orderStatus === s).length })).filter(x => x.count > 0)
    }, [orders])

    if (isLoading) return (
        <div className="h-[280px] animate-pulse bg-slate-50 rounded-2xl flex items-center justify-center">
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Loading chart…</p>
        </div>
    )

    return (
        <div className="space-y-3">
            {/* ── toolbar ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
                    <Tab active={view === "area"} onClick={() => setView("area")}>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />Trend</span>
                    </Tab>
                    <Tab active={view === "funnel"} onClick={() => setView("funnel")}>
                        <span className="flex items-center gap-1"><BarChart2 className="h-3 w-3" />Flow</span>
                    </Tab>
                </div>
                {view === "area" && (
                    <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
                        {(["7d", "30d", "90d"] as Period[]).map(p => (
                            <Tab key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</Tab>
                        ))}
                    </div>
                )}
            </div>

            {/* ── area chart ── */}
            {view === "area" && (
                <>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gDel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false}
                                interval={period === "7d" ? 0 : period === "30d" ? 4 : 9}
                            />
                            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="orders" name="Orders" stroke="#6366F1" strokeWidth={2} fill="url(#gOrders)" dot={false} activeDot={{ r: 4 }} />
                            <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10B981" strokeWidth={2} fill="url(#gDel)" dot={false} activeDot={{ r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 justify-end">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                            <span className="h-2 w-4 rounded-full bg-indigo-400 inline-block" /> Orders
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                            <span className="h-2 w-4 rounded-full bg-emerald-400 inline-block" /> Delivered
                        </span>
                    </div>
                </>
            )}

            {/* ── funnel / flow bars ── */}
            {view === "funnel" && (
                <>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={funnelData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={({ active, payload }) => {
                                if (!active || !payload?.length) return null
                                const d = payload[0].payload
                                return (
                                    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-xs font-semibold">
                                        <p className="text-slate-500 mb-0.5">{d.full}</p>
                                        <p style={{ color: d.fill }} className="text-base font-black">{d.count}</p>
                                    </div>
                                )
                            }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                {funnelData.map((d, i) => (
                                    <Cell key={i} fill={d.fill} fillOpacity={d.count === 0 ? 0.2 : 1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    {/* off-flow exceptions */}
                    {offFlow.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exceptions:</span>
                            {offFlow.map(({ s, count }) => {
                                const m = getSM(s)
                                return (
                                    <span key={s} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", m.pill)}>
                                        {m.short} {count}
                                    </span>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}