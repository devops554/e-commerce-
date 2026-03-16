"use client"
/* ─────────────────────────────────────────────────────────────
   OrderStatsBar.tsx  —  KPI summary row
   Shows: Total | Today | Delivered | Revenue | Pending
───────────────────────────────────────────────────────────────*/
import React, { useMemo } from "react"
import { Package, TrendingUp, CheckCircle2, IndianRupee, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
    orders: any[]
    total: number
    isLoading: boolean
}

interface StatCard {
    label: string
    value: string
    sub?: string
    icon: React.ReactNode
    accent: string
    bg: string
}

export function OrderStatsBar({ orders, total, isLoading }: Props) {
    const stats = useMemo<StatCard[]>(() => {
        const today = new Date().toDateString()
        const todayOrds = orders.filter(o => new Date(o.createdAt).toDateString() === today)
        const delivered = orders.filter(o => o.orderStatus === "delivered")
        const pending = orders.filter(o => ["created", "pending", "confirmed"].includes(o.orderStatus))
        const revenue = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0)

        return [
            {
                label: "Total Orders",
                value: total.toLocaleString("en-IN"),
                sub: "all time",
                icon: <Package className="h-4 w-4" />,
                accent: "text-indigo-600",
                bg: "bg-indigo-50 border-indigo-100",
            },
            {
                label: "Today",
                value: todayOrds.length.toString(),
                sub: "new orders",
                icon: <TrendingUp className="h-4 w-4" />,
                accent: "text-blue-600",
                bg: "bg-blue-50 border-blue-100",
            },
            {
                label: "Delivered",
                value: delivered.length.toString(),
                sub: `${total ? Math.round((delivered.length / total) * 100) : 0}% success rate`,
                icon: <CheckCircle2 className="h-4 w-4" />,
                accent: "text-emerald-600",
                bg: "bg-emerald-50 border-emerald-100",
            },
            {
                label: "Revenue",
                value: `₹${(revenue / 100000).toFixed(1)}L`,
                sub: "from delivered",
                icon: <IndianRupee className="h-4 w-4" />,
                accent: "text-amber-600",
                bg: "bg-amber-50 border-amber-100",
            },
            {
                label: "Pending",
                value: pending.length.toString(),
                sub: "awaiting action",
                icon: <Clock className="h-4 w-4" />,
                accent: "text-orange-600",
                bg: "bg-orange-50 border-orange-100",
            },
        ]
    }, [orders, total])

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className={cn(
                        "rounded-2xl border px-4 py-3.5 flex flex-col gap-1.5 transition-shadow hover:shadow-sm",
                        s.bg
                    )}
                >
                    <div className={cn("flex items-center gap-1.5", s.accent)}>
                        {s.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{s.label}</span>
                    </div>
                    <p className={cn("text-2xl font-black leading-none tracking-tight", s.accent)}>{s.value}</p>
                    {s.sub && <p className="text-[10px] font-semibold text-slate-400">{s.sub}</p>}
                </div>
            ))}
        </div>
    )
}